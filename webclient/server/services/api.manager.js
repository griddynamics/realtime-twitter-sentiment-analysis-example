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

var socketIo;
var instance;

/**
 * Class for sending data to client by socket
 */
class ApiManager {
  constructor() {
    if (!instance) {
      instance = this;
    }

    return instance;
  }

  static setIo(io) {
    socketIo = io;
  }

  static sendTweetStatistic(socket, tweetsStat) {
    socket.emit('tweetStatistic', tweetsStat);
  }

  static sendTweetline(socket, tweets) {
    socket.emit('tweetline', tweets);
  }

  static sendCompareTweetStatistic(socket, tweetsStat) {
    socket.emit('tweetCompareStatistic', tweetsStat);
  }

  static sendOneTweetStatistic(socket, tweetStat) {
    socket.emit('newTweetStatistic', tweetStat);
  }

  static sendFullTweetStatistic(socket, tweetStat) {
    socket.emit('fullTweetStatistic', tweetStat);
  }

  static sendMovieList(socket, movieList) {
    socket.emit('movieList', movieList);
  }
}
module.exports = ApiManager;
