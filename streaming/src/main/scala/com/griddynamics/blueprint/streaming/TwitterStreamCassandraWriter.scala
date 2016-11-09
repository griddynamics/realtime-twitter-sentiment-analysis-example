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

import com.datastax.spark.connector.streaming._
import com.google.common.annotations.VisibleForTesting
import com.griddynamics.blueprint.streaming.domain.{ClassifiedTweet, Tweet}
import org.apache.spark.streaming.dstream.DStream
import org.joda.time.{DateTimeZone, DateTime}

class TwitterStreamCassandraWriter(cassandraKeyspace: String,
                                   cassandraTweetsTable: String,
                                   cassandraTimelineTable: String,
                                   cassandraMinuteCountersTable: String,
                                   cassandraHourlyCountersTable: String) {

  /**
   * Persists classified tweets.
   *
   * Cassandra has two main tables: tweet bodies and timeline, which contains timeseries of tweet ids.
   * Probably the timeline table could also contain tweet bodies, instead of tweet ids, but there is a risk that
   * it would affect performance of range queries which calculate number of tweets in a given time period. So
   * two tables are considered as the most safe and extensible in the future design.
   *
   * Since timeline table may become a bottleneck for selection of number of positive/negative tweets for a large
   * time period, two auxiliary tables were introduced - aggregates by minute and by hour. They are based on C*
   * counters and suffer from potential "duplicated tweets" problem. That's why deduplication (exactly once semantics)
   * is necessary to work with these tables.
   */
  def writeToCassandra(classifiedStream: DStream[ClassifiedTweet]): Unit = {
    writeTweets(classifiedStream)
    updateTimeline(classifiedStream)
    writeMinuteCounters(classifiedStream)
    writeHourlyCounters(classifiedStream)
  }

  @VisibleForTesting
  def writeTweets(classifiedStream: DStream[ClassifiedTweet]): Unit = {
    val tableEntries = classifiedStream.map[TweetsTableEntry](x => new TweetsTableEntry(x))
    tableEntries.saveToCassandra(cassandraKeyspace, cassandraTweetsTable)
  }

  @VisibleForTesting
  def updateTimeline(classifiedStream: DStream[ClassifiedTweet]): Unit = {
    val tableEntries = classifiedStream.map[TimelineTableEntry](x => new TimelineTableEntry(x))
    tableEntries.saveToCassandra(cassandraKeyspace, cassandraTimelineTable)
  }

  @VisibleForTesting
  def writeMinuteCounters(classifiedStream: DStream[ClassifiedTweet]): Unit = {
    classifiedStream
      .map((t: ClassifiedTweet) => (t.movie, new AggregatedMinuteCounter(t).asInstanceOf[AbstractAggregatedCounter]))
    .reduceByKey((a: AbstractAggregatedCounter, b: AbstractAggregatedCounter) => a.add(b))
      .map[AbstractAggregatedCounter]((q: (String, AbstractAggregatedCounter)) => q._2)
      .saveToCassandra(cassandraKeyspace, cassandraMinuteCountersTable)
  }

  @VisibleForTesting
  def writeHourlyCounters(classifiedStream: DStream[ClassifiedTweet]): Unit = {
    classifiedStream
      .map((t: ClassifiedTweet) => (t.movie, new AggregatedHourlyCounter(t).asInstanceOf[AbstractAggregatedCounter]))
      .reduceByKey((a, b) => a.add(b))
      .map[AbstractAggregatedCounter]((q: (String, AbstractAggregatedCounter)) => q._2)
      .saveToCassandra(cassandraKeyspace, cassandraHourlyCountersTable)
  }
}


case class TweetsTableEntry(id: String, movie: String, isNegative: Boolean, tweet: Tweet) {
  def this(classified: ClassifiedTweet) {
    this(classified.body.id, classified.movie, classified.isNegative, classified.body)
  }
}

// Time is count of nano-seconds since start of day
case class TimelineTableEntry(movie: String, date: DateTime, time: Long, id: String, isNegative: Boolean) {
  def this(classified: ClassifiedTweet) {
    this(
      classified.movie,
      new DateTime(classified.body.created, DateTimeZone.UTC),
      new DateTime(classified.body.created, DateTimeZone.UTC).getMillisOfDay * 1000000L, // nanos since start of the day
      classified.body.id,
      classified.isNegative)
    new Date()
  }
}

trait TimeRounder {
  def roundTime(ts: Long, toHours: Boolean): Long
}

object MinuteRounder extends TimeRounder {
  override def roundTime(ts: Long, toHours: Boolean): Long = {
    val tt = new DateTime(ts)
    val tx = tt.secondOfMinute().roundFloorCopy().secondOfMinute().setCopy(0)
    tx.getMillis
  }
}

object HourRounder extends TimeRounder {
  override def roundTime(ts: Long, toHours: Boolean): Long = {
    val tt = new DateTime(ts)
    val tx = tt.minuteOfHour().roundFloorCopy().minuteOfHour().setCopy(0)
    tx.getMillis
  }
}

case class AbstractAggregatedCounter(movie: String,
                                     period_start_ts: Long,
                                     negative_count: Int,
                                     negative_count_0_500_followers: Int,
                                     negative_count_501_5000_followers: Int,
                                     negative_count_5001_inf_followers: Int,
                                     non_negative_count: Int,
                                     non_negative_count_0_500_followers: Int,
                                     non_negative_count_501_5000_followers: Int,
                                     non_negative_count_5001_inf_followers: Int) {

  def this(tweet: ClassifiedTweet, rounder: TimeRounder) {
    this(
      movie = tweet.movie,
      period_start_ts = rounder.roundTime(tweet.body.created, toHours = false),
      negative_count = if (tweet.isNegative) 1 else 0,
      negative_count_0_500_followers = if (tweet.isNegative && tweet.body.followers <= 500) 1 else 0,
      negative_count_501_5000_followers = if (tweet.isNegative && tweet.body.followers > 500 && tweet.body.followers <= 5000) 1 else 0,
      negative_count_5001_inf_followers = if (tweet.isNegative && tweet.body.followers > 5000) 1 else 0,
      non_negative_count = if (!tweet.isNegative) 1 else 0,
      non_negative_count_0_500_followers = if (!tweet.isNegative && tweet.body.followers <= 500) 1 else 0,
      non_negative_count_501_5000_followers = if (!tweet.isNegative && tweet.body.followers > 500 && tweet.body.followers <= 5000) 1 else 0,
      non_negative_count_5001_inf_followers = if (!tweet.isNegative && tweet.body.followers > 5000) 1 else 0
    )
  }

  def add(another: AbstractAggregatedCounter): AbstractAggregatedCounter = {
    this.copy(
      movie = movie,
      period_start_ts = period_start_ts,
      negative_count = negative_count + another.negative_count,
      negative_count_0_500_followers = negative_count_0_500_followers + another.negative_count_0_500_followers,
      negative_count_501_5000_followers = negative_count_501_5000_followers + another.negative_count_501_5000_followers,
      negative_count_5001_inf_followers = negative_count_5001_inf_followers + another.negative_count_5001_inf_followers,
      non_negative_count = non_negative_count + another.non_negative_count,
      non_negative_count_0_500_followers = non_negative_count_0_500_followers + another.non_negative_count_0_500_followers,
      non_negative_count_501_5000_followers = non_negative_count_501_5000_followers + another.non_negative_count_501_5000_followers,
      non_negative_count_5001_inf_followers = non_negative_count_5001_inf_followers + another.non_negative_count_5001_inf_followers)
  }
}

class AggregatedMinuteCounter(t: ClassifiedTweet) extends AbstractAggregatedCounter(tweet = t, MinuteRounder) {}

class AggregatedHourlyCounter(t: ClassifiedTweet) extends AbstractAggregatedCounter(tweet = t, HourRounder) {}
