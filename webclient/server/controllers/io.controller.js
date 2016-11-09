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
/**
 * Created by omaximov on 16/06/16.
 *
 * This controller manage socket.io events.
 */
'use strict';

var StatSubscribe = require('../models/stat.subscribe');
var TweetlineSubscribe = require('../models/tweetline.subscribe');
var TweetStat = require('../models/tweet.stat');
var TweetMessage = require('../models/tweet.message');
var Movie = require('../models/movie');
var ApiManager = require('../services/api.manager');
var async = require('async');
var log = require('./../debug').log('server');

const LIVE_REFRESH_TIME = 5;

/**
 * Object with defining callback functions on socket.io events.
 * for each function first argument is socket, second argument is data
 */
var events = {
  /**
   * request of movie list.
   * Get it from db and answer will be sent by ApiManager
   * @param socket
     */
  getMovieList: function (socket) {
    Movie.getAllList().then(function (movieList) {
      ApiManager.sendMovieList(socket, movieList);
    });
  },

  /**
   * Request historical statistic for single movie.
   * Get it from db and answer will be sent by ApiManager
   * Subscribe socket to new Tweet Statistics for this movie and subscribe to new tweets of this movie
   * @param socket
   * @param data
     */
  getDataForMovie: function (socket, data) {
    if (socket.liveStream == undefined) {
      socket.liveStream = true;
    }
    TweetStat.getStatByMovieId(data['movieId'], data['fromTs'], data['toTs']).then(function (tweetStats) {
      StatSubscribe.getInstance().unsubscribeAnyStat(socket.id);
      StatSubscribe.getInstance().subscribeNewStat(
        LIVE_REFRESH_TIME,
        socket.id,
        'allMovies',
        function (tweetStat) {
          if (tweetStat) {
            TweetStat.getLastStatByMovieIdGenerated(data['movieId']).then(function (oneTweetStat) {
              ApiManager.sendOneTweetStatistic(socket, oneTweetStat);
            });
            ApiManager.sendFullTweetStatistic(socket, tweetStat);

          }
        }
      );
      TweetlineSubscribe.getInstance().unsubscribeAll(socket.id);
      TweetlineSubscribe.getInstance().subscribe(
        LIVE_REFRESH_TIME,
        socket.id,
        data['movieId'],
        function (tweetMessages) {
          log('cb 5 seconds tweetMSG');
          if (tweetMessages && socket.liveStream) {
            ApiManager.sendTweetline(socket, tweetMessages);
          }
        }
      );
      ApiManager.sendTweetStatistic(socket, tweetStats);
    });
  },

  /**
   * Request of historical statistic for two movies
   * Get it from db and answer will be sent by ApiManager
   * @param socket
   * @param data
     */
  getDataCompareForMovies: function (socket, data) {
    var taskNamed = {};
    for (var i = 0; i < data['movies'].length; i++) {
      var movieId = data['movies'][i];
      taskNamed[movieId] = (function (movie) {
        return function (callback) {
          TweetStat.getStatByMovieId(movie, data['fromTs'], data['toTs']).then(function (tweetStats) {
            callback(null, tweetStats);
          });
        };
      })(movieId);
    }
    async.parallel(taskNamed, function (err, movieData) {
      ApiManager.sendCompareTweetStatistic(socket, movieData);
    });
  },

  /**
   * Request of processed tweets for movie
   * Get it from db and answer will be sent by ApiManager
   * @param socket
   * @param data
   */
  getTweetline: function (socket, data) {
    log('tweetline request:'+JSON.stringify(data));
    TweetMessage.getTweets(
      data['movie'],
      data['fromTs'],
      data['toTs'],
      data['perPage'],
      data['page'],
      data['isPositive'],
      data['grade']
    ).then(
      function (res) {
        ApiManager.sendTweetline(socket, res);
      }
    );
  },

  /**
   * Request for change liveStream (new processed tweets) status
   * @param socket
   * @param data
   */
  liveStream: function (socket, data) {
    socket.liveStream = data;
  },

  /**
   * Event will be handled if socket connection is closed
   * @param socket
     */
  disconnect: function (socket) {
    StatSubscribe.getInstance().unsubscribeAnyStat(socket.id);
    TweetlineSubscribe.getInstance().unsubscribeAll(socket.id);
  }
};

/**
 * Class of socket.io controller
 */
class IoController {
  constructor(io) {
    this.io = io;
    io.on(
      'connection',
      socket => {
        this.connected(socket);
      }
    );
    ApiManager.setIo(io);
  }

  /**
   * subscribe to events that need handle
   * @param socket
     */
  connected(socket) {
    for (let eventName in events) {
      socket.on(eventName, (function (eventName) {
        return function (userdata) {
          events[eventName](socket, userdata);
        };
      })(eventName));
    }
  }
}

module.exports = IoController;
