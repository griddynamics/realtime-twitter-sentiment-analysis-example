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
var CassandraDb = require('../services/cassandra.db');

/**
 * Class for loading movie list
 */
class Movie {
  constructor(id, name, imdb, releaseDate) {
    this.id = id;
    this.name = name;
    this.imdb = imdb;
    this.releaseDate = releaseDate;
  }

  static getAllList() {
    var query = 'SELECT * FROM twitter_sentiment.movies';
    return CassandraDb.getInstance().execute(query).then(
      function (rows) {
        var rs = rows[1];
        var ret = [];

        for (var i in rs) {
          var row = rs[i];
          if (row) {
            ret.push(new Movie(row.title, row.title, row.rating, row.release));
          }
        }
        return ret;
      }
    );
  }
}
module.exports = Movie;
