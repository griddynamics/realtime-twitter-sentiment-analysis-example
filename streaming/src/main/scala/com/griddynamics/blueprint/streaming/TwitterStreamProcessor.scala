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

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.griddynamics.blueprint.streaming.classifier.ClassifierFactory
import com.griddynamics.blueprint.streaming.domain.{ClassifiedTweet, TweetAndMovie, Tweet}
import org.apache.spark.streaming.dstream.DStream

class TwitterStreamProcessor(classifierFactory: ClassifierFactory) {

  /**
   * Parses serialized into JSON tweets. For the sake of simplicity invalid tweets cause failure of the whole
   * application. Otherwise we would needed to count and store invalid event for further analysis.
   */
  def parseJSON(stream: DStream[(String, String)]): DStream[TweetAndMovie] = {
    // In this version of Kafka schema key is useless
    val tweetsOnly = stream.map(x => x._2)
    tweetsOnly.map(x => RawTweetJSONParser.fromJson(x))
  }

  def classify(stream: DStream[TweetAndMovie]): DStream[ClassifiedTweet] = {
    // convert to local variable to avoid serialization problems
    val factory = classifierFactory

    val classifiedTweets: DStream[ClassifiedTweet] = stream.mapPartitions(events => {
      val classifier = factory.createClassifier()
      for (ev <- events) yield {
        val decision: Boolean = classifier.classify(ev)
        new ClassifiedTweet(isNeg = decision, tweetAndMovie = ev)
      }
    }, preservePartitioning = true)

    classifiedTweets
  }
}

object RawTweetJSONParser {
  private val mapper = new ObjectMapper()
  mapper.registerModule(DefaultScalaModule)

  /**
   * In this particular example we fail if tweets from Kafka cannot be parsed. Since we fully control writes
   * to Kafka, failures on this stage signify a major problem and the whole process should be stopped.
   * Other applications might decide to split the stream into valid and non-valid events.
   */
  def fromJson(s: String): TweetAndMovie = {
    //TODO: necessity of this weird class will go away once we store non-flat JSON in Kafka
    val flat = mapper.readValue(s, classOf[FlatTweet])
    new TweetAndMovie(
      flat.movieName,
      new Tweet(message = flat.text,
        id = flat.id,
        created = flat.timestamp,
        user = flat.user,
        followers = flat.followers,
        placeName = flat.placeName,
        geoLocation = flat.geoLocation,
        utcOffset = flat.utcOffset))
  }

  //TODO: necessity of this weird class will go away once we store non-flat JSON in Kafka
  case class FlatTweet(text: String, id: String, timestamp: Long, user: String, followers: Int, placeName: String, geoLocation: String, utcOffset: Int, movieName: String) {
  }
}


