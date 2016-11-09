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
package com.griddynamics.blueprint.streaming

import java.util.Date

import com.griddynamics.blueprint.streaming.test.EmbeddedKafkaHelper
import com.griddynamics.blueprint.streaming.twitter.TwitterConstants.{SearchResource, SearchResourceFamily}
import com.griddynamics.blueprint.streaming.twitter.{Main, Tweet}
import kafka.serializer.Decoder
import org.joda.time.DateTime
import org.junit.runner.RunWith
import org.mockito.ArgumentCaptor
import org.mockito.Matchers._
import org.mockito.Mockito._
import org.scalatest.junit.JUnitRunner
import org.scalatest.mock.MockitoSugar
import org.scalatest.{FunSuite, Matchers}
import twitter4j.{Query, QueryResult, RateLimitStatus, Status, StatusListener, Twitter, TwitterStream, User}

import scala.collection.JavaConversions._
import scala.concurrent.Future

private object TwitterMainIT extends MockitoSugar {
  val MovieName = "some movie name"
  private val KafkaTopic = "tweets"
  private val HistTweetMock1 = mockTweet("hist1", 1, new Date(), "user1", 1)
  private val HistTweet1 = Tweet(HistTweetMock1, MovieName)
  private val HistTweetMock2 = mockTweet("hist2", 2, new Date(), "user2", 2)
  private val HistTweet2 = Tweet(HistTweetMock2, MovieName)
  private val RtTweetMock1 = mockTweet("rt1", 3, new Date(), "user1", 1)
  private val RtTweet1 = Tweet(RtTweetMock1, MovieName)
  private val RtTweetMock2 = mockTweet("rt2", 4, new Date(), "user1", 1)
  private val RtTweet2 = Tweet(RtTweetMock2, MovieName)

  private def mockRateLimitStatus(remainingLimits: Int): RateLimitStatus = {
    val res = mock[RateLimitStatus]
    when(res.getRemaining).thenReturn(remainingLimits)
    res
  }

  private def mockQueryResult(rateLimitStatus: RateLimitStatus, tweets: List[Status], hasNext: Boolean = true): QueryResult = {
    val res = mock[QueryResult]
    when(res.getRateLimitStatus).thenReturn(rateLimitStatus)
    when(res.getTweets).thenReturn(tweets)
    val nextQuery = if (hasNext) new Query() else null
    when(res.nextQuery()).thenReturn(nextQuery)
    res
  }

  private def mockUser(screenName: String, followersCnt: Int): User = {
    val res = mock[User]
    when(res.getScreenName).thenReturn(screenName)
    when(res.getFollowersCount).thenReturn(followersCnt)
    res
  }

  private def mockTweet(text: String, id: Long, ts: Date, userName: String, followersCnt: Int): Status = {
    val res = mock[Status]
    when(res.getText).thenReturn(text)
    when(res.getId).thenReturn(id)
    when(res.getCreatedAt).thenReturn(ts)
    val user = mockUser(userName, followersCnt)
    when(res.getUser).thenReturn(user)
    res
  }
}

@RunWith(classOf[JUnitRunner])
class TwitterMainIT extends FunSuite with Matchers with MockitoSugar with EmbeddedKafkaHelper {

  import TwitterMainIT._

  override def beforeAll(): Unit = super.beforeAll()

  override def afterAll(): Unit = super.afterAll()


  test("Sending historical and realtime tweets to Kafka") {
    produceTweets()

    withConsumed[Tweet](4, KafkaTopic, TweetDecoder)(tweets => {
      tweets.toList should contain theSameElementsAs List(HistTweet1, HistTweet2, RtTweet1, RtTweet2)
    })
  }

  private def produceTweets(): Unit = {
    val twitter = {
      val res = mock[Twitter]
      val rateLimitStatus = mockRateLimitStatus(10)
      when(res.getRateLimitStatus(Array(SearchResourceFamily): _*)).thenReturn(Map(SearchResource -> rateLimitStatus))
      val queryRes1 = mockQueryResult(rateLimitStatus, List(HistTweetMock1))
      val queryRes2 = mockQueryResult(rateLimitStatus, List(HistTweetMock2), hasNext = false)
      when(res.search(any[Query])).thenReturn(queryRes1, queryRes2)
      res
    }

    val listener = ArgumentCaptor.forClass(classOf[StatusListener])
    val twitterStream = {
      val res = mock[TwitterStream]
      doNothing().when(res).addListener(listener.capture())
      res
    }

    withProducer[Tweet](KafkaTopic, Tweet.TweetSerializer)(producer => {
      import scala.concurrent.ExecutionContext.Implicits.global

      Future {
        Main.run(twitter, twitterStream, producer, KafkaTopic)(MovieName, DateTime.now, "en")
      }
      // Make sure Main.run() has enough time to do it's work.
      Thread.sleep(1000L)
      listener.getValue.onStatus(RtTweetMock1)
      listener.getValue.onStatus(RtTweetMock2)
      // Make sure messages have arrived to Kafka.
      Thread.sleep(1000L)
    })
  }
}

object TweetDecoder extends Decoder[Tweet] {
  override def fromBytes(data: Array[Byte]): Tweet = {
    Tweet.JsonMapper.readValue[Tweet](data)
  }
}
