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
import java.util.concurrent.TimeUnit

import com.griddynamics.blueprint.streaming.classifier.{CassandraClassificationModelCache, LogisticRegressionClassifierFactory}
import com.typesafe.config.{Config, ConfigFactory, ConfigRenderOptions}
import kafka.serializer.StringDecoder
import org.apache.spark.SparkConf
import org.apache.spark.streaming.kafka.KafkaUtils
import org.apache.spark.streaming.{Seconds, StreamingContext}
import org.slf4j.LoggerFactory
import scopt.OptionParser


object App {
  val programName = "StreamingTweetsAnalyzer"
  val logger = LoggerFactory.getLogger(getClass.getName)

  def main(args: Array[String]) = {
    val parser = new OptionParser[Arguments](programName) {
      head("Executes Spark Streaming job which analyzes tweets from Kafka")
      opt[String]("config") valueName "<config_file>" required() action { (x, c) =>
        c.copy(config = x)
      } text s"Application configuration file on local filesystem"
    }
    val arguments: Option[Arguments] = parser.parse(args, Arguments())
    if (arguments.isEmpty) {
      logger.error("Error occurred during command line arguments parsing. Exiting...")
      sys.exit(1)
    }

    logger.info(s"Using '${arguments.get.config} configuration file'")
    val config = ConfigFactory.parseFile(new File(arguments.get.config)).resolve()
    logger.debug(config.root().render(ConfigRenderOptions.defaults()))

    val sparkConf = new SparkConf()
      .set("spark.cassandra.connection.host", config.getString("streaming.cassandra.host"))
      .set("spark.cassandra.connection.port", config.getString("streaming.cassandra.port"))
      .setAppName(programName)

    val ssc = new StreamingContext(sparkConf, Seconds(1))

    logger.info("Preparing streaming pipeline")
    processTweets(ssc, config)

    logger.info("Running streaming application")
    ssc.start()
    ssc.awaitTermination()
  }

  def processTweets(ssc: StreamingContext, config: Config): Unit = {
    val topic = config.getString("streaming.kafka.topic")

    val kafkaParams = Map[String, String]("metadata.broker.list" -> config.getString("streaming.kafka.brokers"))
    val stream = KafkaUtils.createDirectStream[String, String, StringDecoder, StringDecoder](
      ssc, kafkaParams, Set(topic))

    val processor = new TwitterStreamProcessor(
      new LogisticRegressionClassifierFactory(
        new CassandraClassificationModelCache(
          cassandraHost = config.getString("streaming.cassandra.host"),
          cassandraPort = config.getInt("streaming.cassandra.port"),
          cassandraKeyspace = config.getString("streaming.cassandra.schema.keyspace"),
          modelTable = config.getString("streaming.cassandra.schema.model_table"),
          updatePeriodSec = config.getDuration("streaming.model.update_period", TimeUnit.SECONDS)
        )))
    val parsed = processor.parseJSON(stream)

    val redisDeduplicator = new RedisDeduplicator(
      redisHost = config.getString("streaming.redis.host"),
      redisPort = config.getInt("streaming.redis.port"),
      redisDatabase = config.getInt("streaming.redis.db"))
    val deduplicated = parsed.filter(redisDeduplicator compose (_.tweet)).cache()

    val classified = processor.classify(deduplicated)

    val writer = new TwitterStreamCassandraWriter(
      cassandraKeyspace = config.getString("streaming.cassandra.schema.keyspace"),
      cassandraTweetsTable = config.getString("streaming.cassandra.schema.tweets_table"),
      cassandraTimelineTable = config.getString("streaming.cassandra.schema.timeline_table"),
      cassandraMinuteCountersTable = config.getString("streaming.cassandra.schema.minute_counters_table"),
      cassandraHourlyCountersTable = config.getString("streaming.cassandra.schema.hourly_counters_table")
    )
    writer.writeToCassandra(classified)
  }
}

case class Arguments(config: String = "")