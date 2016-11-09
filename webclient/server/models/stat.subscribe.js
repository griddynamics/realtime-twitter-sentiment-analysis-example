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

var TweetStat = require('./tweet.stat');
var instance = null;
var statInstances = {};
var subscribers = {};

/**
 * Class for subscribe and unsubscribe socket connection to live tweet statistic
 */
class StatSubscribe {
  constructor() {
    if (!instance) {
      instance = this;
    }

    return instance;
  }

  /**
   * subscribe to new tweetStat for movie
   * @param duration integer Callback will be executed every "duration" seconds
   * @param subId string ID of subscriber
   * @param movieId string movie name
     * @param cb callback function first argument is tweetStat for all films for the last "duration" period
     */
  subscribeNewStat(duration, subId, movieId, cb) {
    var qHash = duration + ';' + movieId;
    var self = this;
    if (!statInstances[qHash]) {
      var obj = {};
      obj.instance = setInterval(
        function () {
          self.handleOneStatInstance(duration, movieId);
        },
        duration * 1000
      );
      obj.subscribers = {};
      statInstances[qHash] = obj;
    }
    var subHash = duration + ';' + subId + ';' + movieId;
    subscribers[subId] = {duration: duration, movieId: movieId};
    statInstances[qHash].subscribers[subHash] = {
      cb: cb,
      lastExecute: Math.round(new Date().getTime() / 1000)
    };
  }

  /**
   * unsubscribe subscriber with subId
   * @param subId string
     */
  unsubscribeAnyStat(subId) {
    if (subscribers[subId]) {
      this.unsubscribeNewStat(subscribers[subId].duration, subId, subscribers[subId].movieId);
      delete subscribers[subId];
    }
  }

  /**
   * unsubscribe subscriber with id subId. based on specified parameters
   * @param duration
   * @param subId
   * @param movieId
     */
  unsubscribeNewStat(duration, subId, movieId) {
    var subHash = duration + ';' + subId + ';' + movieId;
    var qHash = duration + ';' + movieId;
    if (statInstances[qHash].subscribers[subHash]) {
      delete statInstances[qHash].subscribers[subHash];
    }
    var count = statInstances[qHash].subscribers.length;
    if (count == 0) {
      clearInterval(statInstances[qHash].instance);
      delete statInstances[qHash];
    }
  }

  /**
   * Internal method for handle TweetStats and alert all subscribers
   * @param duration integer
   * @param movie string
     */
  handleOneStatInstance(duration, movie) {
    TweetStat.getLastStatGenerated(duration).then(function (newTweetStats) {
      if (newTweetStats.length) {
        var qHash = duration + ';' + movie;
        for (var j in statInstances[qHash].subscribers) {
          var cb = statInstances[qHash].subscribers[j].cb;
          if (typeof cb == 'function') {
            for (var i in newTweetStats) {
              var stat = newTweetStats[i];

              cb(stat);
              break;
            }
          }
          statInstances[qHash].subscribers[j].lastExecute = Math.round(new Date().getTime() / 1000);
        }
      }
    });
  }

  /**
   * Return Singletone StatSubscribe
   * @returns {StatSubscribe}
     */
  static getInstance() {
    return new StatSubscribe();
  }

}

module.exports = StatSubscribe;
