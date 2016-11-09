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
import com.griddynamics.blueprint.streaming.test.EmbeddedRedisHelper
import com.redis.RedisClient
import org.scalatest.{FunSuite, Matchers}

class RedisDeduplicatorTestIT extends FunSuite with Matchers with EmbeddedRedisHelper {

  import RedisDeduplicatorTestIT._

  private var redisDeduplicator: RedisDeduplicator = _
  private var redisClient: RedisClient = _

  override def beforeAll(): Unit = {
    super.beforeAll()

    redisClient = new RedisClient(redisHost, redisPort, redisDb)
    redisDeduplicator = new RedisDeduplicator(redisHost, redisPort, redisDb)
  }

  override def afterAll(): Unit = super.afterAll()

  override def beforeEach(): Unit = super.beforeEach()


  test("Redis deduplicator adds IDs of new unique tweets to DB") {
    val t1WasAdded = redisDeduplicator(tweet1)
    val t2WasAdded = redisDeduplicator(tweet2)

    t1WasAdded should be(true)
    t2WasAdded should be(true)
    redisClient.sismember(tweetsKey, tweet1.id) should be(true)
    redisClient.sismember(tweetsKey, tweet2.id) should be(true)
  }

  test("Redis deduplicator doesn't add ID of duplicate tweet to DB") {
    val t1WasAdded = redisDeduplicator(tweet1)
    val t1WasAddedSecondTime = redisDeduplicator(tweet1)

    t1WasAdded should be(true)
    t1WasAddedSecondTime should be(false)
    redisClient.sismember(tweetsKey, tweet1.id) should be(true)
  }
}

private object RedisDeduplicatorTestIT {
  private val redisDb = 0

  private val tweet1 = Tweet("id1", "user1", 1476951269000L, "msg1", 1, "", "", 0)
  private val tweet2 = Tweet("id2", "user2", 1476951994000L, "msg2", 2, "", "", 0)
  private val tweetsKey = "2016-10-20-08"
}
