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
package com.griddynamics.blueprint.streaming.test

import java.net.{BindException, ServerSocket}

import com.redis.RedisClient
import org.scalatest.{BeforeAndAfterAll, BeforeAndAfterEach, Suite}
import org.slf4j.LoggerFactory
import redis.embedded.RedisServer

trait EmbeddedRedisHelper extends BeforeAndAfterAll with BeforeAndAfterEach {
  self: Suite =>

  private val logger = LoggerFactory.getLogger(this.getClass)
  private var redisServer: RedisServer = _
  val redisHost = "localhost"
  val redisPort = scala.util.Properties.propOrElse("redis.reserved.port", "12349").toInt

  override def beforeAll(): Unit = {
    super.beforeAll()

    logger.info(s"Starting embedded Redis on port $redisPort")
    // Unfortunately there are not a lot of choices for integration testing with Redis
    //  1. https://github.com/bsideup/redis-maven-plugin
    //  2. https://github.com/kstyrc/embedded-redis
    // The first option poorly works with Java 8 (tons of stacktraces in logs) and seems to be not supported
    // The second option spawns a child process which sometimes is not killed and becomes an infinitely
    // running orphan Redis which is listening the port.
    //
    // To prevent the orphans we check if the port is occupied and, if yes, we do an ugly assumption that it is
    // Redis. Less of two evils((((

    if (isLocalPortAvailable(redisPort)) {
      redisServer = RedisServer.builder().setting("bind localhost").port(redisPort).build()
      redisServer.start()
    } else {
      logger.warn(
        s"Assigned to Redis port $redisPort is occupied. Will do a naive assumption that it is an orphaned " +
          s"Redis process from abnormally terminated previous runs and blindly continue without Redis starting")
    }
  }

  override def afterAll(): Unit = {
    logger.info("Stopping embedded Redis")
    if (redisServer != null) {
      redisServer.stop()
    }

    super.afterAll()
  }

  override def beforeEach() {
    super.beforeEach()

    logger.debug("Deleting all data from all Redis databases")
    new RedisClient(redisHost, redisPort).flushall
  }

  def isLocalPortAvailable(port: Int): Boolean = {
    var portAvailable = true
    var socket: ServerSocket = null
    try {
      socket = new ServerSocket(port)
    } catch {
      case e: BindException => portAvailable = false
    } finally {
      if (socket != null) {
        socket.close()
      }
    }
    portAvailable
  }
}
