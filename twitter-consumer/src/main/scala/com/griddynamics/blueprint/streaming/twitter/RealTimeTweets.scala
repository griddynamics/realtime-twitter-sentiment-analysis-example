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

import java.util.concurrent.{ArrayBlockingQueue, BlockingQueue}

import org.slf4j.LoggerFactory
import twitter4j.{FilterQuery, RateLimitStatusEvent, RateLimitStatusListener, Status, StatusAdapter, TwitterStream}

class RealTimeTweets(twitterStreamFactory: => TwitterStream) {

  import RealTimeTweets._

  /**
    * Produces real-time stream of tweets containing given movie name.
    *
    * @param movieName movie name to search.
    * @param language  Twitter language.
    * @return
    */
  def search(movieName: String, language: String): Iterator[Tweet] = {
    val twitterStream = twitterStreamFactory

    val tweetQueue = new ArrayBlockingQueue[Tweet](10000)
    twitterStream.addListener(new TwitterStreamListener(movieName, tweetQueue))
    twitterStream.addRateLimitStatusListener(new RateLimitStatusListener {
      override def onRateLimitReached(event: RateLimitStatusEvent): Unit = {
        logger.warn("Rate limit reached")
      }

      override def onRateLimitStatus(event: RateLimitStatusEvent) = {
        logger.warn("onRateLimitStatus")
      }
    })
    logger.info("Loading tweets for '{}'", movieName)
    twitterStream.filter(streamFilter(movieName, language))

    new Iterator[Tweet] {
      override def hasNext = true

      override def next() = {
        tweetQueue.take()
      }
    }
  }

  private def streamFilter(movieName: String, language: String): FilterQuery = {
    new FilterQuery(movieName).language(language)
  }
}


object RealTimeTweets {
  val logger = LoggerFactory.getLogger(RealTimeTweets.getClass)

  private class TwitterStreamListener(movieName: String, queue: BlockingQueue[Tweet]) extends StatusAdapter {
    override def onStatus(status: Status): Unit = {
      logger.debug("Got tweet: {}", Tweet(status, movieName))
      queue.add(Tweet(status, movieName))
    }
  }
}
