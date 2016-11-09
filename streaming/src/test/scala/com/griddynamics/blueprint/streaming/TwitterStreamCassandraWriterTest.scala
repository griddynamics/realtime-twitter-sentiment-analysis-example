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

import com.griddynamics.blueprint.streaming.domain.ClassifiedTweet
import com.griddynamics.blueprint.streaming.test_utils.{SomeClassifiedTweet, SomeTweet}
import org.junit.Assert._
import org.mockito.{Matchers, Mockito}
import org.scalatest.FunSuite

class TwitterStreamCassandraWriterTest extends FunSuite {

  test("sum of counters should be correct") {

    // Given: some counters
    class NaiveAggregatedCounter(t1: ClassifiedTweet) extends AbstractAggregatedCounter(t1, new TimeRounder {
      override def roundTime(ts: Long, toHours: Boolean): Long = ts
    })

    val a = new NaiveAggregatedCounter(
      new SomeClassifiedTweet(withIsNegative = true, withTweet = new SomeTweet(withFollowers = 50)))
    val b = new NaiveAggregatedCounter(
      new SomeClassifiedTweet(withIsNegative = true, withTweet = new SomeTweet(withFollowers = 500)))
    val c = new NaiveAggregatedCounter(
      new SomeClassifiedTweet(withIsNegative = false, withTweet = new SomeTweet(withFollowers = 50)))
    val d = new NaiveAggregatedCounter(
      new SomeClassifiedTweet(withIsNegative = true, withTweet = new SomeTweet(withFollowers = 550)))
    val e = new NaiveAggregatedCounter(
      new SomeClassifiedTweet(withIsNegative = false, withTweet = new SomeTweet(withFollowers = 700)))
    val f = new NaiveAggregatedCounter(
      new SomeClassifiedTweet(withIsNegative = true, withTweet = new SomeTweet(withFollowers = 5500)))
    val g = new NaiveAggregatedCounter(
      new SomeClassifiedTweet(withIsNegative = false, withTweet = new SomeTweet(withFollowers = 7000)))

    // When: I calculated sum of them
    val result = a.add(b).add(c).add(d).add(e).add(f).add(g)

    // Then: the sum should be correct
    assertEquals(SomeTweet.default_movie, result.movie)
    assertEquals(SomeTweet.default_created, result.period_start_ts)
    assertEquals(4, result.negative_count)
    assertEquals(3, result.non_negative_count)
    assertEquals(2, result.negative_count_0_500_followers)
    assertEquals(1, result.non_negative_count_0_500_followers)
    assertEquals(1, result.negative_count_501_5000_followers)
    assertEquals(1, result.non_negative_count_501_5000_followers)
    assertEquals(1, result.negative_count_5001_inf_followers)
    assertEquals(1, result.non_negative_count_5001_inf_followers)
  }

  test("minute counters time should be rounded properly") {
    val tsMillis = 1475454823001L // Mon, 03 Oct 2016 00:33:43.001 GMT
    val tweet = new SomeClassifiedTweet(withTweet = new SomeTweet(withCreated = tsMillis))
    val counter = new AggregatedMinuteCounter(tweet)

    val expected = 1475454780000L // Mon, 03 Oct 2016 00:33:00.000 GMT
    assertEquals(expected, counter.period_start_ts)
  }

  test("hourly counters time should be rounded properly") {
    val tsMillis = 1475454823001L // Mon, 03 Oct 2016 00:33:43.001 GMT
    val tweet = new SomeClassifiedTweet(withTweet = new SomeTweet(withCreated = tsMillis))
    val counter = new AggregatedHourlyCounter(tweet)

    val expected = 1475452800000L // Mon, 03 Oct 2016 00:00:00.000 GMT
    assertEquals(expected, counter.period_start_ts)
  }

  test("all tables should be populated") {
    val writerSpy = Mockito.spy(new TwitterStreamCassandraWriter(null, null, null, null, null))
    Mockito.doNothing().when(writerSpy).writeTweets(Matchers.any())
    Mockito.doNothing().when(writerSpy).updateTimeline(Matchers.any())
    Mockito.doNothing().when(writerSpy).writeMinuteCounters(Matchers.any())
    Mockito.doNothing().when(writerSpy).writeHourlyCounters(Matchers.any())

    writerSpy.writeToCassandra(null)

    Mockito.verify(writerSpy, Mockito.times(1)).writeTweets(Matchers.any())
    Mockito.verify(writerSpy, Mockito.times(1)).updateTimeline(Matchers.any())
    Mockito.verify(writerSpy, Mockito.times(1)).writeMinuteCounters(Matchers.any())
    Mockito.verify(writerSpy, Mockito.times(1)).writeHourlyCounters(Matchers.any())
  }
}
