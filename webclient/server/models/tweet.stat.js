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
var mainConfig = require('../main.config');
var moment = require('moment');

const PERIOD_HOUR = 3600;
const PERIOD_MINUTE = 60;
const MIN_HOUR_POINTS = 60;

let lastTweetStats = {};
let lastTweetStatsAll = {};
let fieldListMap = {
  tweetCounterNegative: 'negative_count',
  tweetCounterNegativeLow: 'negative_count_0_500_followers',
  tweetCounterNegativeMiddle: 'negative_count_501_5000_followers',
  tweetCounterNegativeHigh: 'negative_count_5001_inf_followers',
  tweetCounterPositive: 'non_negative_count',
  tweetCounterPositiveLow: 'non_negative_count_0_500_followers',
  tweetCounterPositiveMiddle: 'non_negative_count_501_5000_followers',
  tweetCounterPositiveHigh: 'non_negative_count_5001_inf_followers'
};
let emptyData = {
  'negative_count': 0,
  'negative_count_0_500_followers': 0,
  'negative_count_501_5000_followers': 0,
  'negative_count_5001_inf_followers': 0,
  'non_negative_count': 0,
  'non_negative_count_0_500_followers': 0,
  'non_negative_count_501_5000_followers': 0,
  'non_negative_count_5001_inf_followers': 0
};

/**
 * Class container TweetStat for statistic of tweets.
 * associated with tables twitter_sentiment.hourly_counters and twitter_sentiment.minutes_counters
 */
class TweetStat {
  constructor(timestamp, period, movieId, rowData) {
    this.movieId = movieId;
    this.period = period;
    this.timestamp = timestamp;
    for (var key in fieldListMap) {
      if (rowData[fieldListMap[key]]) {
        this[key] = rowData[fieldListMap[key]];
      } else {
        this[key] = 0;
      }
    }
  }

  strId() {
    return this.movieId + ';' + this.timestamp + ';' + this.period;
  }

  /**
   * Return true if all meaningful props is 0
   * @returns {boolean}
     */
  isEmpty() {
    for (var key in fieldListMap) {
      if (this[key]) {
        return false;
      }
    }
    return true;
  }

  /**
   * helper method for sum or subtract two tweetStat
   * @param addObj TweetStat
   * @param mul integer -1 if we are want subtract, 1 if we want sum
     */
  round(addObj, mul) {
    if (!mul) {
      mul = 1;
    }
    for (var key in fieldListMap) {
      this[key] += parseInt(addObj[key]) * mul;
    }
  }

  /**
   * Returns TweetStats for movie in selected period
   * @param movieId string movie name
   * @param from integer unixtimestamp
   * @param to integer unixtimestamp
   * @returns {Promise}
     */
  static getStatByMovieId(movieId, from, to) {
    from = parseInt(from);
    to = parseInt(to);
    if (from > to) {
      var tmp = from;
      from = to;
      to = tmp;
    }
    var duration = 3600;

    var timePeriod = to - from;
    var splitDuration = TweetStat.getSplitDuration(from, to);

    var table = 'twitter_sentiment.hourly_counters';
    if (splitDuration.period == PERIOD_MINUTE) {
      duration = 30;
      table = 'twitter_sentiment.minute_counters';
    }


    return new Promise(function (resolve) {
      var ret = [];
      var current;
      var startTimestamp;
      if (!from) {
        current = Math.round(new Date().getTime() / 1000);
        startTimestamp = current;
      } else {
        current = parseInt(from) + timePeriod;
        startTimestamp = parseInt(from);
      }
      var query = 'SELECT * FROM ' + table + ' WHERE movie = ? AND period_start_ts > ? AND period_start_ts <= ?';
      var ts = moment(startTimestamp, 'X').format('YYYY-MM-DD HH:mm:ssZ');
      var endTs = moment((to), 'X').format('YYYY-MM-DD HH:mm:ssZ');
      //console.log('timestamp', ts, startTimestamp, ' end TS', endTs, 'query ', query);
      return CassandraDb.getInstance().execute(query, [movieId, ts, endTs]).then(
        function (rows) {
          var rs = rows[1];
          var fromTs = 0;
          var toTs = 0;
          var ts = 0;
          rows = [];
          for (var i in rs) {
            var row = rs[i];
            if (row) {
              rows.push(row);
              ts = Math.round(row.period_start_ts.getTime() / 1000);
              if (fromTs === 0 || fromTs > ts) {
                fromTs = ts;
              }
              if (toTs < ts) {
                toTs = ts;
              }
            }
          }

          splitDuration = TweetStat.getSplitDuration(fromTs, toTs, splitDuration.period);

          var currentTime = fromTs;
          var newTweetStat = new TweetStat(currentTime, splitDuration.duration, movieId, emptyData);
          for (var j in rows) {
            row = rows[j];
            if (row) {
              ts = Math.round(row.period_start_ts.getTime() / 1000);
              var stat = new TweetStat(ts, duration, movieId, row);
              //in calculated period
              if ((stat.timestamp + stat.period - currentTime - splitDuration.duration) <= 0) {
                newTweetStat.round(stat, 1);
              } else {//now start ne period
                if (!newTweetStat.isEmpty()) {
                  //save previous period statistic to result
                  ret.push(newTweetStat);
                }

                var dlt = (ts - from) % splitDuration.duration;
                currentTime = ts - dlt;
                newTweetStat = new TweetStat(currentTime, splitDuration.duration, movieId, emptyData);
                newTweetStat.round(stat, 1);
              }

            }
          }
          if (!newTweetStat.isEmpty()) {
            //save last period statistic to result
            ret.push(newTweetStat);
          }
          //console.log('results:',ret.length);
          resolve(ret);

        }
      );
    });
  }

  /**
   * internal helper method for selecting base period and limit results by mainConfig.COUNT_GRAPHIC_POINTS_MAX
   * @param from integer unixtimestamp
   * @param to integer unixtimestamp
   * @param minPeriod
   * @returns {{period: number, duration: number}}
     */
  static getSplitDuration(from, to, minPeriod) {
    var delta = to - from;
    var ret = 1;
    var period = 1;
    if (minPeriod == undefined) {
      minPeriod = PERIOD_MINUTE;
    }

    if ((delta / PERIOD_HOUR < MIN_HOUR_POINTS) && (minPeriod <= PERIOD_MINUTE)) {
      ret = PERIOD_MINUTE;
      period = PERIOD_MINUTE;
      ret = (Math.ceil(delta / (ret * mainConfig.COUNT_GRAPHIC_POINTS_MAX))) * PERIOD_MINUTE;
    } else {
      ret = PERIOD_HOUR;
      period = PERIOD_HOUR;
      ret = (Math.ceil(delta / (ret * mainConfig.COUNT_GRAPHIC_POINTS_MAX))) * PERIOD_HOUR;
    }

    return {period: period, duration: ret};
  }

  /**
   * Returns TweetStat for movie in last period. Must be called after getLastStatGenerated method
   * @param movieId string movie name
   * @returns {Promise.<*[]>}
     */
  static getLastStatByMovieIdGenerated(movieId) {
    if (lastTweetStats[movieId]) {
      return Promise.resolve([lastTweetStats[movieId]]);
    } else {
      return Promise.resolve([new TweetStat((parseInt(moment().format('X')) - 5), 5, movieId, emptyData)]);
    }
  }

  /**
   * Returns TweetStat for all movies in last period
   * @param duration integer piriond in seconds
   * @returns {Promise.<*[]>}
   */
  static getLastStatGenerated(duration) {
    var table = 'twitter_sentiment.minute_counters';

    var dt = PERIOD_MINUTE;
    var ts = Math.round(new Date().getTime() / 1000) - dt * 2;
    var ts_utc = moment(ts, 'X');
    ts_utc.utcOffset(0);
    var ts_q2 = ts_utc.format('YYYY-MM-DD HH:mm:ssZ');
    var query = 'SELECT * FROM ' + table + ' WHERE period_start_ts > ? ALLOW FILTERING';
    var tweetStatMap = {};
    return CassandraDb.getInstance().execute(query, [ts_q2]).then(
      function (rows) {
        var rs = rows[1];
        // var cntRows = 0;
        for (var i in rs) {
          var row = rs[i];
          if (row) {
            // cntRows++;
            var ts = Math.round(row.period_start_ts.getTime() / 1000);
            var stat = new TweetStat(ts, duration, row.movie, row);
            if (tweetStatMap[stat.movieId] == undefined) {
              tweetStatMap[stat.movieId] = [];
            }
            tweetStatMap[stat.movieId].push(stat);
          }
        }

        //sorting map
        for (var movieId in tweetStatMap) {
          tweetStatMap[movieId].sort(function (a, b) {
            return a.timestamp - b.timestamp;
          });
        }

        //calculating diff
        var totalStat = new TweetStat((parseInt(moment().format('X')) - duration), duration, 'allMovies', emptyData);
        //reset old data
        lastTweetStats = {};
        let createTimestamp = parseInt(moment().format('X')) - duration;
        for (movieId in tweetStatMap) {
          if (!lastTweetStatsAll[movieId]) {
            lastTweetStatsAll[movieId] = [];
          }
          var newTweetStat = new TweetStat(createTimestamp, duration, movieId, emptyData);
          if (lastTweetStatsAll[movieId].length && tweetStatMap[movieId].length) {
            var lastInd = lastTweetStatsAll[movieId].length - 1;

            var lastId = lastTweetStatsAll[movieId][lastInd].strId();

            var addMod = false;
            for (var k = 0; k < tweetStatMap[movieId].length; k++) {
              if (lastId == tweetStatMap[movieId][k].strId()) {
                newTweetStat.round(lastTweetStatsAll[movieId][lastInd], -1);
                addMod = true;
              }
              if (addMod) {
                newTweetStat.round(tweetStatMap[movieId][k]);
              }
            }
            if (!addMod) {
              for (var l = 0; l < tweetStatMap[movieId].length; l++) {
                newTweetStat.round(tweetStatMap[movieId][l]);
              }
            }
            totalStat.round(newTweetStat);
          }
          if (tweetStatMap[movieId].length) {
            lastTweetStatsAll[movieId] = tweetStatMap[movieId];
          }
          lastTweetStats[movieId] = newTweetStat;
        }

        for (movieId in lastTweetStatsAll) {
          if (!lastTweetStats[movieId] || (lastTweetStats[movieId].timestamp < createTimestamp)) {
            lastTweetStats[movieId] = new TweetStat(createTimestamp, duration, movieId, emptyData);
          }
        }

        return [totalStat];
      }
    );
  }

}
module.exports = TweetStat;
