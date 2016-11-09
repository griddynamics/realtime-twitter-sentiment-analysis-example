/**
 * Copyright © 2016 Grid Dynamics (info@griddynamics.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
var cassandra = require('cassandra-driver');
var async = require('async');
var mainConfig = require('../main.config');
var log = require('./../debug').log('server');

var instance = null;
var client = null;

/**
 * Class wrapper for working with cassandra DB
 */
class CassandraDb {
  constructor() {
    if (!instance) {
      instance = this;
      client = new cassandra.Client({contactPoints: mainConfig.cassandraDb.contactPoints});
      this.connected = false;
      this.connectedErr = false;

      client.connect(function (err) {
        if (err) {
          instance.connectedErr = err;
          client.shutdown();
          return;
        }
        instance.connected = true;
      });

    }

    return instance;
  }

  getClient() {
    var self = this;
    return new Promise(function (resolve, reject) {
      if (self.connectedErr) {
        reject(self.connectedErr);
      } else if (self.connected) {
        resolve(client);
      } else {
        client.connect(function (err) {
          if (err) {
            instance.connectedErr = err;
            client.shutdown();
            //console.error('There was an error when connecting', err);
            return;
          }
          instance.connected = true;
        });
      }
    });
  }

  execute(query, data) {
    return new Promise(function (resolve, reject) {
      async.series(
        [
          function connect(next) {
            client.connect(next);
          },
          function selectingData(next) {
            client.execute(query, data, {prepare: true}, function (err, result) {
              if (err) return next(err);

              log('cassandra request: %s %s %s', query, ' data:', JSON.stringify(data));
              next(null, result.rows);
            });
          }
        ],
        function (err, result) {
          if (err) {
            reject(err);
          }
          resolve(result);
        }
      );
    });
  }

  /**
   * Method for processing many of request to cassandra DB
   * @param queries string[] Array of queries
   * @returns {Promise}
     */
  executeAll(queries) {
    var namedTasks = {};
    for (var i = 0; i < queries.length; i++) {
      namedTasks[i] = (function (query) {
        return function (callback) {
          CassandraDb.getInstance().execute(query, []).then(function (rows) {
            var rs = rows[1];

            callback(null, rs);
          });
        };
      })(queries[i]);
    }

    return new Promise(function (resolve, reject) {
      async.parallel(namedTasks, function (err, results) {
        if (err) {
          reject(err);
        }
        var ret = [];
        if (results) {
          for (var key in results) {
            ret = ret.concat(results[key]);
          }
        }
        resolve([ret.length, ret]);
      });
    });
  }

  getDbTimestamp() {
    return Promise.resolve(Math.round(new Date().getTime() / 1000));
  }

  static getInstance() {
    return new CassandraDb();
  }


}
module.exports = CassandraDb;
