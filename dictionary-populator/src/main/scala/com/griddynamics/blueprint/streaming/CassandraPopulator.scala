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

import com.datastax.driver.core.{Cluster, Session, SocketOptions}
import com.google.common.annotations.VisibleForTesting
import com.typesafe.config.{Config, ConfigFactory, ConfigRenderOptions}
import org.slf4j.LoggerFactory
import scopt.OptionParser

class CassandraPopulator {
  private val logger = LoggerFactory.getLogger(getClass.getName)

  @VisibleForTesting
  def run(config: Config): Unit = {
    val session = {
      val host = config.getString("populator.cassandra.host")
      val port = config.getInt("populator.cassandra.port")
      val keyspace = config.getString("populator.cassandra.schema.keyspace")
      connectToCassandra(host, port, keyspace)
    }

    val dao = {
      val table = config.getString("populator.cassandra.schema.model_table")
      getDAO(session, table)
    }

    val coefficientsFile = new File(config.getString("populator.model.coefficients_file"))
    val dictionaryFile = new File(config.getString("populator.model.dictionary_file"))

    logger.info(s"Start populating Cassandra with root words dictionary ($dictionaryFile)")
    try {
      dao.insertModel(coefficientsFile, dictionaryFile)
      logger.info(s"Finish populating Cassandra with model coefficients.")
    } finally {
      logger.info("Closing connection to Cassandra...")
      session.close()
      session.getCluster.close()
      logger.info("Connection to Cassandra was closed.")
    }
    logger.info("Exiting.")
  }

  @VisibleForTesting
  def connectToCassandra(host: String, port: Int, keyspace: String): Session = {
    logger.info(s"Connecting to Cassandra at '$host:$port'")
    val cluster = Cluster.builder
      .addContactPoint(host)
      .withPort(port)
      .withSocketOptions(new SocketOptions().setConnectTimeoutMillis(10000).setReadTimeoutMillis(20000))
      .build()

    cluster.connect(keyspace)
  }

  @VisibleForTesting
  def getDAO(session: Session, table: String): WeightedDictionaryModelDAO = {
    new WeightedDictionaryModelDAO(session, table)
  }
}

object CassandraPopulator {
  private val logger = LoggerFactory.getLogger(getClass.getName)

  def main(args: Array[String]) = {
    val parser = new OptionParser[Arguments]("Weighted Dictionary populator to Cassandra database") {
      head("Writes weighted dictionary and model coefficients to Cassandra")
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

    new CassandraPopulator().run(config)
  }

  case class Arguments(config: String = "")
}

