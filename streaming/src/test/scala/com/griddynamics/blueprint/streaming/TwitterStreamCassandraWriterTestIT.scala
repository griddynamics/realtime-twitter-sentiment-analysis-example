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

import com.datastax.spark.connector._
import com.griddynamics.blueprint.streaming.domain.ClassifiedTweet
import com.griddynamics.blueprint.streaming.test.EmbeddedCassandraHelper
import com.griddynamics.blueprint.streaming.test_utils.{SomeClassifiedTweet, SomeTweet}
import com.holdenkarau.EmbeddedSparkHelper
import org.apache.spark.streaming.dstream.DStream
import org.junit.Assert._
import org.junit.runner.RunWith
import org.scalatest.FunSuite
import org.scalatest.junit.JUnitRunner


@RunWith(classOf[JUnitRunner])
class TwitterStreamCassandraWriterTestIT extends FunSuite with EmbeddedSparkHelper with EmbeddedCassandraHelper {
  private val cassandraKeyspace = "twitter_sentiment"
  private val cassandraTweetType = "tweet"
  private val cassandraTweetsTable = "tweets"
  private val cassandraTimelineTable = "timeline"
  private val cassandraMinuteCountersTable = "minute_counters"
  private val cassandraHourlyCountersTable = "hourly_counters"

  override def beforeAll(): Unit = {
    conf.set("spark.cassandra.connection.host", "localhost")
    conf.set("spark.cassandra.connection.port", getNativePort.toString)
    super.beforeAll()

    createKeyspaceIfNotExists(cassandraKeyspace)
    dropTableIfExists(cassandraKeyspace, cassandraTweetsTable)
    dropTypeIfExists(cassandraKeyspace, cassandraTweetType)
    dropTableIfExists(cassandraKeyspace, cassandraTimelineTable)
    dropTableIfExists(cassandraKeyspace, cassandraMinuteCountersTable)
    dropTableIfExists(cassandraKeyspace, cassandraHourlyCountersTable)
    executeClasspath("twitter_sentiment.tweets.cql")
    executeClasspath("twitter_sentiment.timeline.cql")
    executeClasspath("twitter_sentiment.minute_counters.cql")
    executeClasspath("twitter_sentiment.hourly_counters.cql")
  }

  before{
    truncateTable(cassandraKeyspace, cassandraTweetsTable)
    truncateTable(cassandraKeyspace, cassandraTimelineTable)
    truncateTable(cassandraKeyspace, cassandraMinuteCountersTable)
    truncateTable(cassandraKeyspace, cassandraHourlyCountersTable)
  }

  test("tweets should be written correctly") {
    // Given: a classified tweet which we want to write
    val input = Seq(Seq(new SomeClassifiedTweet()))
    val writer = new TwitterStreamCassandraWriter(cassandraKeyspace, cassandraTweetsTable, null, null, null)

    // When: I write it
    runAction(input, (x: DStream[ClassifiedTweet]) => writer.writeTweets(x))

    //Then: it should be fully written
    val result = sc.cassandraTable[TweetsTableEntry](cassandraKeyspace, cassandraTweetsTable).collect()
    assertEquals(1, result.length)
    assertEquals(SomeClassifiedTweet.default_tweet.id, result.head.id)
    assertEquals(SomeClassifiedTweet.default_movie, result.head.movie)
    assertEquals(SomeClassifiedTweet.default_isNegative, result.head.isNegative)
    assertEquals(SomeClassifiedTweet.default_tweet, result.head.tweet)
  }

  test("timeline table should be written correctly") {
    // Given: a classified tweet
    val input = Seq(
      Seq(// Fri, 13 Feb 2009 23:31:30 GMT
        new SomeClassifiedTweet(
          withIsNegative = false,
          withMovie = "movie1",
          withTweet = new SomeTweet(withId = "id1", withCreated = 1234567890000L))))
    val writer = new TwitterStreamCassandraWriter(cassandraKeyspace, null, cassandraTimelineTable, null, null)

    // When: I populate the table
    runAction(input, (x: DStream[ClassifiedTweet]) => writer.updateTimeline(x))

    // Then: There still should be only one record in the whole table
    val result = sc.cassandraTable[TimelineTableEntry](cassandraKeyspace, cassandraTimelineTable).collect()
    assertEquals(1, result.length)
    assertEquals("movie1", result.head.movie)
    assertEquals("id1", result.head.id)

    // explicitly check that the tweet is selectable from CQL with correct date and time
    val cqlResult = getCQLSession(cassandraKeyspace)
      .execute(s"SELECT * FROM $cassandraKeyspace.$cassandraTimelineTable WHERE movie='movie1' AND date='2009-02-13' AND time='23:31:30'")
    assertEquals(1, cqlResult.all().size())
  }

  test("minute and hourly positive/negative counters should be written correctly") {
    // Given: two tweets in two batches, what is important
    val input = Seq(
      Seq(// Mon, 03 Oct 2016 00:33:43 GMT
        new SomeClassifiedTweet(withIsNegative = false, withTweet = new SomeTweet(withCreated = 1475454823000L))),
      Seq(// Mon, 03 Oct 2016 00:33:05 GMT
        new SomeClassifiedTweet(withIsNegative = false, withTweet = new SomeTweet(withCreated = 1475454785000L))))
    val writer = new TwitterStreamCassandraWriter(cassandraKeyspace, null, null, cassandraMinuteCountersTable, cassandraHourlyCountersTable)

    // When: I update minute and hourly counters
    runAction(input, (x: DStream[ClassifiedTweet]) => writer.writeMinuteCounters(x))
    runAction(input, (x: DStream[ClassifiedTweet]) => writer.writeHourlyCounters(x))

    // Then: The positive/negative counters should be properly written
    val minuteResult = sc.cassandraTable[AbstractAggregatedCounter](cassandraKeyspace, cassandraMinuteCountersTable).collect()
    assertEquals(1, minuteResult.length)
    assertEquals(SomeTweet.default_movie, minuteResult.head.movie)
    assertEquals(1475454780000L, minuteResult.head.period_start_ts) // Mon, 03 Oct 2016 00:33:00.000 GMT
    assertEquals(0, minuteResult.head.negative_count)
    assertEquals(2, minuteResult.head.non_negative_count)

    val hourlyResult = sc.cassandraTable[AbstractAggregatedCounter](cassandraKeyspace, cassandraHourlyCountersTable).collect()
    assertEquals(1, hourlyResult.length)
    assertEquals(SomeTweet.default_movie, hourlyResult.head.movie)
    assertEquals(1475452800000L, hourlyResult.head.period_start_ts) // Mon, 03 Oct 2016 00:33:00.000 GMT
    assertEquals(0, hourlyResult.head.negative_count)
    assertEquals(2, hourlyResult.head.non_negative_count)
  }

  test("minute and hourly follower groups counters should be written correctly") {
    // Given: several tweets with different count of followers
    val input = Seq(
      Seq(// Mon, 03 Oct 2016 00:33:43 GMT
        new SomeClassifiedTweet(withIsNegative = true, withTweet = new SomeTweet(withFollowers = 200)),
        new SomeClassifiedTweet(withIsNegative = false, withTweet = new SomeTweet(withFollowers = 501)),
        new SomeClassifiedTweet(withIsNegative = false, withTweet = new SomeTweet(withFollowers = 502)),
        new SomeClassifiedTweet(withIsNegative = true, withTweet = new SomeTweet(withFollowers = 6000)),
        new SomeClassifiedTweet(withIsNegative = false, withTweet = new SomeTweet(withFollowers = 7000))
      ))
    val writer = new TwitterStreamCassandraWriter(cassandraKeyspace, null, null, cassandraMinuteCountersTable, cassandraHourlyCountersTable)

    // When: I update minute and hourly counters
    runAction(input, (x: DStream[ClassifiedTweet]) => writer.writeMinuteCounters(x))
    runAction(input, (x: DStream[ClassifiedTweet]) => writer.writeHourlyCounters(x))

    // Then: counters should be correctly adjusted for corresponding follower groups
    val minuteResult = sc.cassandraTable[AbstractAggregatedCounter](cassandraKeyspace, cassandraMinuteCountersTable).collect()
    assertEquals(1, minuteResult.length)
    assertEquals(1, minuteResult.head.negative_count_0_500_followers)
    assertEquals(0, minuteResult.head.non_negative_count_0_500_followers)
    assertEquals(0, minuteResult.head.negative_count_501_5000_followers)
    assertEquals(2, minuteResult.head.non_negative_count_501_5000_followers)
    assertEquals(1, minuteResult.head.negative_count_5001_inf_followers)
    assertEquals(1, minuteResult.head.non_negative_count_5001_inf_followers)

    val hourlyResult = sc.cassandraTable[AbstractAggregatedCounter](cassandraKeyspace, cassandraHourlyCountersTable).collect()
    assertEquals(1, hourlyResult.length)
    assertEquals(1, hourlyResult.head.negative_count_0_500_followers)
    assertEquals(0, hourlyResult.head.non_negative_count_0_500_followers)
    assertEquals(0, hourlyResult.head.negative_count_501_5000_followers)
    assertEquals(2, hourlyResult.head.non_negative_count_501_5000_followers)
    assertEquals(1, hourlyResult.head.negative_count_5001_inf_followers)
    assertEquals(1, hourlyResult.head.non_negative_count_5001_inf_followers)
  }
}
