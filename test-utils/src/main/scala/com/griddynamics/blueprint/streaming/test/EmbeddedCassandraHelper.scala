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

import java.util
import javax.management.InstanceAlreadyExistsException

import com.datastax.driver.core._
import org.apache.log4j.{Level, Logger}
import org.cassandraunit.CQLDataLoader
import org.cassandraunit.dataset.cql.ClassPathCQLDataSet
import org.scalatest.{BeforeAndAfter, BeforeAndAfterAll, Suite}

import scala.collection.JavaConversions._

trait EmbeddedCassandraHelper extends BeforeAndAfterAll with BeforeAndAfter {
  self: Suite =>

  private val LOG: Logger = Logger.getLogger(classOf[EmbeddedCassandraHelper])
  private val nativePort: Int = scala.util.Properties.propOrElse("cassandra.nativeTransportPort", "19042").toInt
  private var cql_cluster: Cluster = _
  private var cql_session: Session = _

  @throws(classOf[InstanceAlreadyExistsException])
  override def beforeAll() {
    super.beforeAll()

    Logger.getLogger("org.apache.cassandra").setLevel(Level.WARN)
    Logger.getLogger("com.datastax.driver").setLevel(Level.WARN)
    this.cql_cluster = Cluster.builder
      .addContactPoint(getHost)
      .withPort(getNativePort)
      .withSocketOptions(new SocketOptions().setConnectTimeoutMillis(10000).setReadTimeoutMillis(20000))
      .build
    val metadata: Metadata = this.cql_cluster.getMetadata
    LOG.debug(String.format("Connected to cluster: %s", metadata.getClusterName))
    for (host: Host <- metadata.getAllHosts) {
      LOG.debug(String.format("Datacenter: %s; Host: %s; Rack: %s\n", host.getDatacenter, host.getAddress, host.getRack))
    }
  }

  override def afterAll() {
    this.cql_cluster.close()
    super.afterAll()
  }

  after {
    if (this.cql_session != null) {
      this.cql_session.close()
      this.cql_session = null
    }
  }

  def getCQLSession: Session = {
    getCQLSession(null)
  }

  def getCQLSession(keyspace: String): Session = {
    if (this.cql_session != null) {
      return cql_session
    }
    if (keyspace == null) {
      this.cql_session = this.cql_cluster.connect
    }
    else {
      this.cql_session = this.cql_cluster.connect(keyspace)
    }
    this.cql_session
  }

  def withCQLSession(keyspace: String)(body: Session => Unit): Unit = {
    val session = this.cql_cluster.connect(keyspace)
    try {
      body(session)
    } finally {
      session.close()
    }
  }

  def getHost: String = {
    "localhost"
  }

  def getNativePort: Int = {
    nativePort
  }

  def executeClasspath(resourceName: String) {
    val cqlLoader: CQLDataLoader = new CQLDataLoader(getCQLSession)
    cqlLoader.load(new ClassPathCQLDataSet(resourceName, false, false))
  }

  def truncateTable(ks: String, table: String) {
    getCQLSession.execute(s"TRUNCATE $ks.$table")
  }

  def dropTableIfExists(ks: String, table: String) {
    getCQLSession.execute(s"DROP TABLE IF EXISTS $ks.$table")
  }

  def dropTypeIfExists(ks: String, table: String): Unit = {
    getCQLSession.execute(s"DROP TYPE IF EXISTS $ks.$table")
  }

  private def deleteAllKeyspaces() {
    val keyspaces: util.List[KeyspaceMetadata] = getCQLSession.getCluster.getMetadata.getKeyspaces
    for (keyspace: KeyspaceMetadata <- keyspaces) {
      if (!keyspace.getName.startsWith("system")) {
        this.dropKeyspace(keyspace.getName)
      }
    }
  }

  def dropKeyspace(ks: String) {
    getCQLSession.execute(s"DROP KEYSPACE $ks")
  }

  def createKeyspaceIfNotExists(ks: String) {
    getCQLSession.execute(s"CREATE KEYSPACE IF NOT EXISTS $ks WITH replication = {'class':'SimpleStrategy', 'replication_factor':1}")
  }
}
