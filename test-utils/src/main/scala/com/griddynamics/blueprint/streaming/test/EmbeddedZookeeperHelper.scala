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

import java.io.File
import java.net.InetSocketAddress
import java.nio.file.Paths

import org.apache.commons.io.FileUtils
import org.apache.zookeeper.server.{ServerCnxnFactory, ZooKeeperServer}
import org.scalatest.{BeforeAndAfterAll, Suite}
import org.slf4j.LoggerFactory


trait EmbeddedZookeeperHelper extends BeforeAndAfterAll {
  self: Suite =>

  private val logger = LoggerFactory.getLogger(classOf[EmbeddedZookeeperHelper])
  private val maxConnections = 1024
  private val zkTempDir = new File("./target/zk")
  private val snapDir = Paths.get(zkTempDir.getPath, "snapshot").toFile
  private val logDir = Paths.get(zkTempDir.getPath, "log").toFile
  private val tickTime = 500

  val zkHost = "localhost"
  val zkPort = scala.util.Properties.propOrElse("zookeeper.reserved.port", "12181").toInt
  val zkConnectString = s"$zkHost:$zkPort"

  private var serverFactory: ServerCnxnFactory = _

  override def beforeAll(): Unit = {
    super.beforeAll()

    logger.info(s"Starting embedded ZooKeeper on port $zkPort")
    FileUtils.deleteDirectory(zkTempDir)
    zkTempDir.mkdir()
    serverFactory = ServerCnxnFactory.createFactory(new InetSocketAddress(zkHost, zkPort), maxConnections)
    serverFactory.startup(new ZooKeeperServer(snapDir, logDir, tickTime))
  }

  override def afterAll(): Unit = {
    logger.info("Stopping embedded ZooKeeper")

    if (serverFactory != null) serverFactory.shutdown()

    super.afterAll()
  }
}
