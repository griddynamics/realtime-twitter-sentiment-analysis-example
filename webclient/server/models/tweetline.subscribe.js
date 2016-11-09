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

var TweetMessage = require('./tweet.message');
var instance = null;
var statInstances = {};
var subscribers = {};

/**
 * Class for subscribe and unsubscribe socket connection to live tweets
 */
class TweetlineSubscribe {
  constructor() {
    if (!instance) {
      instance = this;
    }

    return instance;
  }

  /**
   * subscribe to new tweets for movie
   * @param duration integer in seconds
   * @param subId string
   * @param movieId string movie name
     * @param cb callback
     */
  subscribe(duration, subId, movieId, cb) {
    var qHash = duration + ';' + movieId;

    var self = this;
    if (!statInstances[qHash]) {
      var obj = {};

      obj.instance = setInterval(
        function () {
          self.handleOneInstance(duration, movieId);
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
   * @param subId
     */
  unsubscribeAll(subId) {
    if (subscribers[subId]) {
      this.unsubscribe(subscribers[subId].duration, subId, subscribers[subId].movieId);
      delete subscribers[subId];
    }
  }

  /**
   * unsubscribe subscriber with id subId. based on specified parameters
   * @param duration
   * @param subId
   * @param movieId
     */
  unsubscribe(duration, subId, movieId) {
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
   * Internal method for handle tweets and alert all subscribers
   * @param duration
   * @param movie
     */
  handleOneInstance(duration, movie) {
    TweetMessage.getLastTweets(movie).then(function (newTweetMessages) {
      if (newTweetMessages.tweets.length) {
        var qHash = duration + ';' + movie;
        for (var j in statInstances[qHash].subscribers) {
          var cb = statInstances[qHash].subscribers[j].cb;
          if (typeof cb == 'function') {
            cb(newTweetMessages);
          }
          statInstances[qHash].subscribers[j].lastExecute = Math.round(new Date().getTime() / 1000);
        }
      }
    });
  }

  /**
   * Return Singletone TweetlineSubscribe
   * @returns {TweetlineSubscribe}
     */
  static getInstance() {
    return new TweetlineSubscribe();
  }

}

module.exports = TweetlineSubscribe;
