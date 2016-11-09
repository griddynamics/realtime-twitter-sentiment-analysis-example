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

import java.io.File

import com.datastax.spark.connector._
import com.griddynamics.blueprint.streaming.test.{EmbeddedCassandraHelper, EmbeddedKafkaHelper, EmbeddedRedisHelper}
import com.holdenkarau.spark.testing.LocalSparkContext
import com.typesafe.config.ConfigFactory
import org.apache.spark.streaming.{Seconds, StreamingContext}
import org.apache.spark.{SparkConf, SparkContext}
import org.junit.Assert._
import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner
import org.scalatest.{BeforeAndAfterAll, FunSuite}

import scala.collection.JavaConverters._

@RunWith(classOf[JUnitRunner])
class AppTestIT
  extends FunSuite
    with BeforeAndAfterAll
    with EmbeddedKafkaHelper
    with EmbeddedCassandraHelper
    with EmbeddedRedisHelper {

  import AppTestIT._

  private var sc: SparkContext = _

  override def beforeAll(): Unit = {
    super.beforeAll()

    createKeyspaceIfNotExists(cassandraKeyspace)
    dropTableIfExists(cassandraKeyspace, cassandraTweetsTable)
    dropTypeIfExists(cassandraKeyspace, cassandraTweetType)
    dropTableIfExists(cassandraKeyspace, cassandraTimelineTable)
    dropTableIfExists(cassandraKeyspace, cassandraMinuteCountersTable)
    dropTableIfExists(cassandraKeyspace, cassandraHourlyCountersTable)
    dropTableIfExists(cassandraKeyspace, cassandraModelTable)
    executeClasspath("twitter_sentiment.tweets.cql")
    executeClasspath("twitter_sentiment.timeline.cql")
    executeClasspath("twitter_sentiment.minute_counters.cql")
    executeClasspath("twitter_sentiment.hourly_counters.cql")
    executeClasspath("twitter_sentiment.model.cql")
    createTopic(kafkaTopic)

    val sparkConf = new SparkConf()
      .setAppName(App.programName)
      .setMaster("local[*]")
      .set("spark.cassandra.connection.host", "localhost")
      .set("spark.cassandra.connection.port", getNativePort.toString)
      .set("spark.ui.enabled", "false")

    sc = new SparkContext(sparkConf)
  }


  override def beforeEach(): Unit = {
    super.beforeEach()

    withCQLSession(cassandraKeyspace) { session =>
      val modelDao = new WeightedDictionaryModelDAO(session, cassandraModelTable)
      modelDao.insertModel(
        new File("./src/test/resources/test_model_coefficients.csv").getAbsoluteFile,
        new File("./src/test/resources/test_weighted_dictionary.csv").getAbsoluteFile)
    }
  }

  override def afterAll(): Unit = {
    try {
      LocalSparkContext.stop(sc)
      sc = null
    } finally {
      super.afterAll()
    }
  }

  test("Should consume tweet from Kafka, classify and save to Cassandra") {
    val props = Map(
      "streaming.kafka.topic" -> kafkaTopic,
      "streaming.kafka.brokers" -> s"$kafkaHost:$kafkaPort",
      "streaming.redis.host" -> redisHost,
      "streaming.redis.port" -> redisPort,
      "streaming.redis.db" -> redisDB,
      "streaming.model.update_period" -> "1h",
      "streaming.cassandra.host" -> "localhost",
      "streaming.cassandra.port" -> getNativePort,
      "streaming.cassandra.schema.keyspace" -> cassandraKeyspace,
      "streaming.cassandra.schema.model_table" -> cassandraModelTable,
      "streaming.cassandra.schema.tweets_table" -> cassandraTweetsTable,
      "streaming.cassandra.schema.timeline_table" -> cassandraTimelineTable,
      "streaming.cassandra.schema.minute_counters_table" -> cassandraMinuteCountersTable,
      "streaming.cassandra.schema.hourly_counters_table" -> cassandraHourlyCountersTable
    )
    val config = ConfigFactory.parseMap(props.asJava)
    val ssc = new StreamingContext(sc, Seconds(2))
    ssc.checkpoint(new File("target/spark/checkpoint").getAbsolutePath)
    App.processTweets(ssc, config)
    ssc.start()

    //When: a tweet is send to Kafka
    val tweet =
    """
      {
        "text": "We're showing Suicide Squad, for free in the Pine Lounge tonight and tomorrow! We'll have free popcorn, just bring… https://t.co/psvpoSWCkZ",
        "id": "id1",
        "timestamp": 12345,
        "user": "user1",
        "followers": 5,
        "placeName": "place1",
        "geoLocation": "location1",
        "utcOffset": 3,
        "movieName": "Suicide Squad"
      }
    """
    sendMessage(kafkaTopic, tweet)
    // Duplicate tweet should be filtered out.
    sendMessage(kafkaTopic, tweet)

    ssc.stop(stopSparkContext = false, stopGracefully = true)


    //Then: the tweet should be classified and saved to Cassandra
    val tweets = sc.cassandraTable[TweetsTableEntry](cassandraKeyspace, cassandraTweetsTable).collect()
    assertEquals(1, tweets.length)
    assertEquals("id1", tweets.head.id)
    assertEquals("Suicide Squad", tweets.head.movie)
    assertEquals(false, tweets.head.isNegative)
    assertEquals("user1", tweets.head.tweet.user)

    val timeline = sc.cassandraTable[TimelineTableEntry](cassandraKeyspace, cassandraTimelineTable).collect()
    assertEquals(1, timeline.length)
    assertEquals("Suicide Squad", timeline.head.movie)
    assertEquals("id1", timeline.head.id)

    val minuteCounters = sc.cassandraTable[AbstractAggregatedCounter](cassandraKeyspace, cassandraMinuteCountersTable).collect()
    assertEquals(1, minuteCounters.length)

    val hourlyCounters = sc.cassandraTable[AbstractAggregatedCounter](cassandraKeyspace, cassandraHourlyCountersTable).collect()
    assertEquals(1, hourlyCounters.length)
  }
}

object AppTestIT {
  private val redisDB = 0
  private val cassandraKeyspace = "twitter_sentiment"
  private val cassandraModelTable = "model"
  private val cassandraTweetType = "tweet"
  private val cassandraTweetsTable = "tweets"
  private val cassandraTimelineTable = "timeline"
  private val cassandraMinuteCountersTable = "minute_counters"
  private val cassandraHourlyCountersTable = "hourly_counters"
  private val kafkaTopic = "tweets"
}
