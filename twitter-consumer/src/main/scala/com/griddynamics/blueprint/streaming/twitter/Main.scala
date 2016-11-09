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

import java.io.File
import java.util.Properties

import com.griddynamics.blueprint.streaming.twitter.Tweet.TweetSerializer
import com.typesafe.config.{Config, ConfigFactory, ConfigRenderOptions}
import org.apache.kafka.clients.producer.{KafkaProducer, ProducerConfig}
import org.apache.kafka.common.serialization.StringSerializer
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import org.slf4j.LoggerFactory
import scopt.OptionParser
import twitter4j.conf.{Configuration, ConfigurationBuilder}
import twitter4j.{Twitter, TwitterFactory, TwitterStream, TwitterStreamFactory}

object Main {
  val logger = LoggerFactory.getLogger(Main.getClass)

  def main(args: Array[String]): Unit = {
    val parser = new OptionParser[Arguments]("Twitter loader") {
      opt[String]("config").action((x, c) => c.copy(config = x))
        .text("application configuration file on local filesystem")
      opt[String]("movie").action((m, c) => c.copy(movieName = m)).text("search tweets containing movie name").required()
      opt[String]("search-since").action((d, c) =>
        c.copy(searchSince = DateTimeFormat.forPattern("yyyy-MM-dd").parseDateTime(d))
      ).text("date since which to search tweets in yyyy-MM-dd format, default is today's date")
    }

    val arguments = parser.parse(args, Arguments())
    if (arguments.isEmpty) {
      logger.error("Error occurred during command line arguments parsing. Exiting...")
      sys.exit(1)
    }
    run(arguments.get.config, arguments.get.movieName, arguments.get.searchSince)
  }

  private def run(config: String, movieName: String, startDate: DateTime): Unit = {
    val conf = ConfigFactory.parseFile(new File(config)).withFallback(ConfigFactory.load()).resolve()

    logger.debug("Config:")
    logger.debug(conf.root().render(ConfigRenderOptions.defaults()))

    val kafkaProducer = new KafkaProducer[String, Tweet](buildKafkaConf(conf), new StringSerializer, TweetSerializer)
    val kafkaTopicName = conf.getString("kafka.topic")

    val twitterConf = buildTwitterConf(conf)
    val twitter = new TwitterFactory(twitterConf).getInstance

    val lang = conf.getString("twitter.language")
    run(twitter, new TwitterStreamFactory(twitterConf).getInstance, kafkaProducer, kafkaTopicName)(movieName, startDate, lang)
  }

  def run(twitter: Twitter, twitterStreamFactory: => TwitterStream, kafkaProducer: KafkaProducer[String, Tweet], kafkaTopic: String)
         (movieName: String, startDate: DateTime, lang: String): Unit = {
    val tweets = Iterator(
      new HistoricalTweets(twitter).search(movieName, startDate, lang),
      new RealTimeTweets(twitterStreamFactory).search(movieName, lang)
    ).flatten

    val kafkaSender = new KafkaSender(kafkaProducer, kafkaTopic)
    for (t <- tweets) {
      kafkaSender.send(t)
    }
  }

  private def buildKafkaConf(conf: Config): Properties = {
    val res = new Properties
    res.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, conf.getString("kafka.brokers"))
    res.put(ProducerConfig.BATCH_SIZE_CONFIG, conf.getString("kafka.batchSize"))
    res
  }

  private def buildTwitterConf(conf: Config): Configuration = {
    new ConfigurationBuilder()
      .setDebugEnabled(true)
      .setOAuthConsumerKey(conf.getString("twitter.consumerKey"))
      .setOAuthConsumerSecret(conf.getString("twitter.consumerSecret"))
      .setOAuthAccessToken(conf.getString("twitter.accessToken"))
      .setOAuthAccessTokenSecret(conf.getString("twitter.accessTokenSecret"))
      .build
  }

  private case class Arguments(config: String = "", movieName: String = "", searchSince: DateTime = DateTime.now())

}