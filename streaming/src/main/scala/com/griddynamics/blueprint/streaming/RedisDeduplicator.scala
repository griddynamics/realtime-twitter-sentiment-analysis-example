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

import com.griddynamics.blueprint.streaming.domain.Tweet
import com.redis.RedisClient
import org.joda.time.DateTime

/**
  * Uses Redis sets for tweets deduplication.
  * Keys are tweets creation dates rounded up to hour,
  * values are sets of tweets IDs with creation date corresponding to these hours.
  */
case class RedisDeduplicator(redisHost: String,
                             redisPort: Int,
                             redisDatabase: Int) extends (Tweet => Boolean) {

  import RedisDeduplicator._

  lazy val redisClient = new RedisClient(redisHost, redisPort, redisDatabase)

  /**
    * @param tweet tweet for duplicate check.
    * @return `true` if `tweet` is new and added to Redis, `false` if `tweet` is duplicate.
    */
  override def apply(tweet: Tweet): Boolean = {
    val key = keyFromDatetimeUtc(tweet.createdAtUtc)
    val numOfAdded = redisClient.sadd(key, tweet.id)
    numOfAdded.exists(_ > 0)
  }
}

object RedisDeduplicator {
  def keyFromDatetimeUtc(datetimeUtc: DateTime): String = datetimeUtc.toString("yyyy-MM-dd-HH")
}