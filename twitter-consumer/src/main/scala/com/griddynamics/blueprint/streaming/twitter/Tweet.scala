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

import java.util

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.fasterxml.jackson.module.scala.experimental.ScalaObjectMapper
import org.apache.kafka.common.serialization.Serializer
import twitter4j.Status

case class Tweet(@JsonProperty text: String,
                 @JsonProperty id: String,
                 @JsonProperty timestamp: Long,
                 @JsonProperty user: String,
                 @JsonProperty followers: Int,
                 @JsonProperty placeName: String,
                 @JsonProperty geoLocation: String,
                 @JsonProperty utcOffset: Int,
                 @JsonProperty movieName: String) {
  def toJsonBytes: Array[Byte] = {
    Tweet.JsonMapper.writeValueAsBytes(this)
  }
}

object Tweet {
  val JsonMapper = {
    val res = new ObjectMapper with ScalaObjectMapper
    res.registerModule(DefaultScalaModule)
    res
  }

  val TweetSerializer = new Serializer[Tweet] {
    override def serialize(topic: String, data: Tweet): Array[Byte] = {
      data.toJsonBytes
    }

    override def configure(configs: util.Map[String, _], isKey: Boolean): Unit = ()

    override def close(): Unit = ()
  }

  def apply(tweet: Status, movieName: String): Tweet = {
    new Tweet(
      text = tweet.getText,
      id = tweet.getId.toString,
      timestamp = tweet.getCreatedAt.getTime,
      user = tweet.getUser.getScreenName,
      followers = tweet.getUser.getFollowersCount,
      placeName = Option(tweet.getPlace).flatMap(place => Option(place.getFullName)).getOrElse(""),
      geoLocation = Option(tweet.getGeoLocation).flatMap(geo => Option(geo.toString)).getOrElse(""),
      utcOffset = 0,
      movieName = movieName)
  }

}

