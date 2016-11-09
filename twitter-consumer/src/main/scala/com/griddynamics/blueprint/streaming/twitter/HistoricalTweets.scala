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
package com.griddynamics.blueprint.streaming.twitter

import org.joda.time.DateTime
import org.slf4j.LoggerFactory
import twitter4j.{Query, RateLimitStatus, Twitter}

import scala.annotation.tailrec
import scala.collection.JavaConversions._

class HistoricalTweets(twitter: Twitter) {

  import com.griddynamics.blueprint.streaming.twitter.HistoricalTweets.logger

  /**
    * Searches for tweets containing given movie name starting from given date until now.
    *
    * @param movieName movie name to search.
    * @param startDate date in yyyy-MM-dd format since which to search tweets.
    * @param language  Twitter language.
    * @return
    */
  def search(movieName: String, startDate: DateTime, language: String): Iterator[Tweet] = {
    waitForLimitReset(twitter.getRateLimitStatus(TwitterConstants.SearchResourceFamily).get(TwitterConstants.SearchResource))

    @tailrec
    def loop(currQuery: Query, acc: Stream[Tweet]): Stream[Tweet] = {
      if (currQuery != null) {
        val searchResult = twitter.search(currQuery)
        waitForLimitReset(searchResult.getRateLimitStatus)
        val tweets = searchResult.getTweets.map(Tweet(_, movieName))
        logger.info("Got {} tweets.", tweets.length)
        loop(searchResult.nextQuery(), acc append tweets)
      } else acc
    }

    logger.info("Start searching historical tweets for movie '{}'.", movieName)
    loop(searchQuery(movieName, startDate, language), Stream.empty).iterator
  }

  private def waitForLimitReset(rateLimitStatus: RateLimitStatus): Unit = {
    if (rateLimitStatus.getRemaining < 1) {
      logger.info("Waiting for {} seconds until API request limit reset.", rateLimitStatus.getSecondsUntilReset)
      Thread.sleep(rateLimitStatus.getSecondsUntilReset * 1000)
    }
  }

  private def searchQuery(movieName: String, searchSince: DateTime, language: String) = {
    val queryTmp = new Query(movieName)
    queryTmp.setLang(language)
    queryTmp.setSince(searchSince.toString("yyyy-MM-dd"))
    queryTmp
  }
}

object HistoricalTweets {
  val logger = LoggerFactory.getLogger(getClass)
}
