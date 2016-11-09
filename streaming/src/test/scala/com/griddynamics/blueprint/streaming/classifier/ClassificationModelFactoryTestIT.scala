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
package com.griddynamics.blueprint.streaming.classifier

import com.datastax.driver.core.querybuilder.QueryBuilder
import com.griddynamics.blueprint.streaming.WeightedDictionaryModelDAO
import com.griddynamics.blueprint.streaming.test.EmbeddedCassandraHelper
import org.scalatest.{BeforeAndAfterAll, FunSuite, Matchers}

import scala.collection.JavaConverters._

class ClassificationModelFactoryTestIT extends FunSuite with Matchers with BeforeAndAfterAll with EmbeddedCassandraHelper {

  import ClassificationModelFactoryTestIT._

  override def beforeAll(): Unit = {
    super.beforeAll()

    createKeyspaceIfNotExists(cassandraKeyspace)
    dropTableIfExists(cassandraKeyspace, cassandraModelTable)
    executeClasspath("twitter_sentiment.model.cql")
  }

  test("Model should be reloaded after update period") {
    val modelFactory = new CassandraClassificationModelCache(
      cassandraHost = "localhost",
      cassandraPort = getNativePort,
      cassandraKeyspace = cassandraKeyspace,
      modelTable = cassandraModelTable,
      updatePeriodSec = 1
    )

    withCQLSession(cassandraKeyspace) { session =>
      val insertStmt = QueryBuilder.insertInto(cassandraModelTable)
        .value("id", WeightedDictionaryModelDAO.Id)
        .value("intercept", 1.1)
        .value("threshold", 2.1)
        .value("words", Map.empty.asJava)
      session.execute(insertStmt)
    }

    modelFactory.getModel.intercept shouldBe 1.1
    modelFactory.getModel.threshold shouldBe 2.1
    modelFactory.getModel.getWordCoefficient("lalala") shouldBe None


    // Wait for model update to complete.
    Thread.sleep(1000L)

    truncateTable(cassandraKeyspace, cassandraModelTable)
    withCQLSession(cassandraKeyspace) { session =>
      val insertStmt = QueryBuilder.insertInto(cassandraModelTable)
        .value("id", WeightedDictionaryModelDAO.Id)
        .value("intercept", 1.2)
        .value("threshold", 2.2)
        .value("words", Map("lalala" -> 0.42).asJava)
      session.execute(insertStmt)
    }

    modelFactory.getModel.intercept shouldBe 1.2
    modelFactory.getModel.threshold shouldBe 2.2
    modelFactory.getModel.getWordCoefficient("lalala") shouldBe Some(0.42)
  }
}

object ClassificationModelFactoryTestIT {
  private val cassandraKeyspace = "twitter_sentiment"
  private val cassandraModelTable = "model"
}
