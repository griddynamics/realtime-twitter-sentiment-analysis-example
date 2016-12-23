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
var MemoryCache = require('../services/memory.cache');
var moment = require('moment');
var log = require('./../debug').log('tweetline');
const MAX_PROCESSING_TIME = 30;

var fieldList = ['id', 'created', 'followers', 'is_negative', 'message', 'movie', 'user'];
var timelineLastElement = {};
var timelineLastIds = {};
var MAX_PAGE_TWEETS = 10;
var popularRanges = {
  low: [0, 500],
  middle: [501, 5000],
  high: [5001, Infinity]
};

/**
 * Class for work with tweet messages.
 */
class TweetMessage {
  constructor(rawData) {
    if (rawData['tweet']) {
      var tweetObj = rawData['tweet'];
      for (var i = 0; i < fieldList.length; i++) {
        var field = fieldList[i];

        if (tweetObj[field] != undefined) {
          this[field] = tweetObj[field];
        }
      }
    }
    for (i = 0; i < fieldList.length; i++) {
      field = fieldList[i];
      if (rawData[field] != undefined) {
        this[field] = rawData[field];
      }
    }

  }

  /**
   * Method for grtting tweet messages for specified period.
   *
   * @param movieId string movie name
   * @param from integer unixtimestamp
   * @param to integer unixtimestamp
   * @param per_page integer
   * @param page_num integer starts from 1
   * @param isPositive boolean
   * @param grade string ('low','middle','high')
     * @returns {Promise}
     */
  static getTweets(movieId, from, to, per_page, page_num, isPositive, grade) {
    from = parseInt(from);
    to = parseInt(to);
    if (from > to) {
      var tmp = from;
      from = to;
      to = tmp;
    }

    return new Promise(function (resolve) {
      var ret = [];

      var hashKey = [movieId, from, to].join(';');
      var j = 0;
      MemoryCache.getInstance().getValue(hashKey).then(
        function (ids) {
          if (!ids) {
            //console.log('MC empty', ids);
            var datetimes = TweetMessage.splitIntervalsToDateAndTime(from, to);
            var queries = TweetMessage.generateTimelineQueries(movieId, datetimes, 'id, date, time', isPositive);

            return CassandraDb.getInstance().executeAll(queries).then(
              function (rows) {
                var rs = rows[1];
                var idsList = [];
                for (var i in rs) {
                  var row = rs[i];
                  if (row) {
                    j++;
                    let obj = {
                      id: row.id,
                      createTime: parseInt(moment(row.date + 'T' + row.time + '+00:00').format('X'))
                    };
                    idsList.push(obj);
                  }
                }
                idsList.sort(function (a, b) {
                  return a.createTime - b.createTime;
                });
                return Promise.resolve(idsList);
              }
            );
          } else {
            return Promise.resolve(ids);

          }
        }
      ).then(
        function (ids) {
          MemoryCache.getInstance().setValue(hashKey, ids, 30);
          var pages = Math.ceil(ids.length / per_page);
          return tweetRequest(page_num);

          function tweetRequest(page_num) {
            let toPos = (page_num ) * per_page;
            if (toPos > (ids.length - 1)) {
              toPos = ids.length;
            }
            var reqIds = ids.slice((page_num - 1) * per_page, toPos);
            //console.log('from:', (page_num - 1) * per_page, ' to:', toPos, ' cnt:', reqIds.length);
            var reqId = reqIds.map(function (val) {
              return `'${val.id}'`;
            });
            if(reqId.length == 0){
              log('strange len: 0, total:'+ids.length);
            }
            var idsList = reqId.join(',');
            var query = 'SELECT * FROM twitter_sentiment.tweets WHERE id IN (' + idsList + ')';
            return CassandraDb.getInstance().execute(query, []).then(
              function (rows) {
                var rs = rows[1];
                for (var i in rs) {
                  var row = rs[i];
                  if (row) {
                    var tweet = new TweetMessage(row);
                    let needAdd = true;
                    if (isPositive != undefined && tweet.is_negative == isPositive) {
                      needAdd = false;
                    }
                    let range = popularRanges[grade];
                    if (range != undefined && !(tweet.followers >= range[0] && tweet.followers <= range[1])) {
                      needAdd = false;
                    }
                    if (needAdd) {
                      ret.push(tweet);
                      if(ret.length == per_page){
                        break;
                      }
                    }
                  }
                }
                if(ret.length == per_page || page_num == pages) {
                  resolve({
                    tweets: ret,
                    pages: pages,
                    page_num: page_num
                  });
                }else{
                  return tweetRequest(page_num+1);
                }
              }
            );
          }

        }
      );
    });
  }

  /**
   * Method return new tweets for specified movie.
   * Every result return new data, or empty result
   * @param movieId string
   * @returns {Promise}
     */
  static getLastTweets(movieId) {
    let from = parseInt(moment().format('X')) - MAX_PROCESSING_TIME;
    let to = parseInt(moment().format('X'))+3600;

    if (timelineLastElement[movieId]) {
      from = timelineLastElement[movieId].createTime;
    }
    return new Promise(function (resolve) {
      var ret = [];
      var hashKey = 'last;' + [movieId, from, to].join(';');

      MemoryCache.getInstance().getValue(hashKey).then(
        function (ids) {
          if (!ids) {
            var datetimes = TweetMessage.splitIntervalsToDateAndTime(from, to);
            var queries = TweetMessage.generateTimelineQueries(movieId, datetimes, 'id, date, time');
            return CassandraDb.getInstance().executeAll(queries).then(
              function (rows) {
                var rs = rows[1];
                var idsList = [];
                for (var i in rs) {
                  var row = rs[i];
                  if (row) {
                    let obj = {
                      id: row.id,
                      createTime: parseInt(moment(row.date + 'T' + row.time + '+00:00').format('X'))
                    };
                    if(!timelineLastIds[movieId] || !timelineLastIds[movieId][obj.id]) {
                      idsList.push(obj);
                    }
                  }
                }
                idsList.sort(function (a, b) {
                  return b.createTime - a.createTime;
                });

                return Promise.resolve(idsList);
              }
            );
          } else {
            return Promise.resolve(ids);

          }
        }
      ).then(
        function (ids) {

          if(ids.length){

            if((timelineLastElement[movieId] && ids[0].createTime != timelineLastElement[movieId].createTime) || (!timelineLastElement[movieId])) {
              timelineLastElement[movieId] = ids[0];
              timelineLastIds[movieId] = {};
            }
            for(let i = 0;i<ids.length;i++){
              var el = ids[i];
              if(el.createTime == timelineLastElement[movieId].createTime){
                timelineLastIds[movieId][el.id] = true;
              }else{
                break;
              }
            }
          }
          var pages = Math.ceil(ids.length / MAX_PAGE_TWEETS);
          var page_num = 1;
          let toPos = (page_num ) * MAX_PAGE_TWEETS;
          if (toPos > (ids.length - 1)) {
            toPos = ids.length;
          }

          var reqIds = ids.slice((page_num - 1) * MAX_PAGE_TWEETS, toPos);
          var reqId = reqIds.map(function (val) {
            return `'${val.id}'`;
          });

          var idsList = reqId.join(',');
          var query = 'SELECT * FROM twitter_sentiment.tweets WHERE id IN (' + idsList + ')';
          return CassandraDb.getInstance().execute(query, []).then(
            function (rows) {
              var rs = rows[1];
              for (var i in rs) {
                var row = rs[i];
                if (row) {
                  var tweet = new TweetMessage(row);
                  ret.push(tweet);
                }
              }

              resolve({
                tweets: ret,
                pages: pages,
                page_num: MAX_PAGE_TWEETS,
                idsMap: timelineLastIds[movieId],
                lastElement: timelineLastElement[movieId],
                reqIds: reqIds
              });
            }
          );

        }
      ).catch(function(e){log('have error:'+e.message+' in line '+e.lineNumber);});
    });
  }

  /**
   * Helper function for generating queries to twitter_sentiment.timeline table.
   * @param movie string
   * @param datetimes Array
   * @param selectedFields string fields from twitter_sentiment.timeline table separated by comma
   * @returns {Array}
     */
  static generateTimelineQueries(movie, datetimes, selectedFields) {
    var queries = [];
    if (selectedFields == undefined) {
      selectedFields = 'id';
    }
    var query = 'SELECT ' + selectedFields + ' FROM twitter_sentiment.timeline WHERE movie = ';
    var parts = [`'${movie}'`];
    var onlyDays = [];
    for (var i = 0; i < datetimes.length; i++) {
      var obj = datetimes[i];
      if (!obj.fromTime && !obj.toTime) {
        onlyDays.push(`'${obj.date}'`);
      } else {
        parts.push(`date = '${obj.date}'`);
        if (obj.fromTime) {
          parts.push(`time >= '${obj.fromTime}'`);
        }
        if (obj.toTime) {
          parts.push(`time <= '${obj.toTime}'`);
        }
        queries.push(query + parts.join(' AND '));
        parts = [`'${movie}'`];
      }
    }
    if (onlyDays.length) {
      parts.push('date IN (' + onlyDays.join(',') + ')');
      queries.push(query + parts.join(' AND '));
    }
    return queries;
  }

  /**
   * Helper function for generating array of datetimes.
   * Neede for using with generateTimelineQueries method
   * @param fromTs
   * @param toTs
   * @returns {Array}
     */
  static splitIntervalsToDateAndTime(fromTs, toTs) {
    var ret = [];
    var fromTime = moment(fromTs, 'X');
    var toTime = moment(toTs, 'X');
    fromTime.utcOffset(0);
    toTime.utcOffset(0);

    var startDay = fromTime.dayOfYear();
    var endDay = toTime.dayOfYear();
    var tmpM;
    if (endDay < startDay) {
      tmpM = fromTime.clone();
      tmpM.endOf('year');
      endDay += tmpM.dayOfYear();
    }
    tmpM = fromTime.clone();
    var obj;
    for (var day = startDay; day <= endDay; day++) {
      obj = {};
      obj.date = tmpM.format('YYYY-MM-DD');
      tmpM.add(1, 'd');
      ret.push(obj);
    }
    var startDate = fromTime.format('YYYY-MM-DD');
    var endDate = toTime.format('YYYY-MM-DD');
    for (var i = 0; i < ret.length; i++) {
      obj = ret[i];
      if (obj.date == startDate) {
        obj.fromTime = fromTime.format('HH:mm:ss');
      }
      if (obj.date == endDate) {
        obj.toTime = toTime.format('HH:mm:ss');
      }
    }
    return ret;
  }

}
module.exports = TweetMessage;
