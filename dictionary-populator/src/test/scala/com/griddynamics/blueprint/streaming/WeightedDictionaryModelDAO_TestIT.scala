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

import java.io.{File, IOException, StringReader}

import com.datastax.driver.core.querybuilder.QueryBuilder
import com.griddynamics.blueprint.streaming.test.EmbeddedCassandraHelper
import org.junit.runner.RunWith
import org.scalatest.junit.JUnitRunner
import org.scalatest.{BeforeAndAfterEach, FunSuite, Matchers}

import scala.collection.JavaConverters._

@RunWith(classOf[JUnitRunner])
class WeightedDictionaryModelDAO_TestIT extends FunSuite with Matchers with EmbeddedCassandraHelper with BeforeAndAfterEach {

  import WeightedDictionaryModelDAO_TestIT._

  override def beforeAll(): Unit = {
    super.beforeAll()

    createKeyspaceIfNotExists(cassandraKeyspace)
    dropTableIfExists(cassandraKeyspace, cassandraModelTable)
    executeClasspath("060_twitter_sentiment.model.cql")
  }

  override def beforeEach() {
    super.beforeEach()

    truncateTable(cassandraKeyspace, cassandraModelTable)
  }

  test("csv file without necessary columns") {
    val csv = new StringReader("col1, col3\na,1.0")
    intercept[IOException] {
      WeightedDictionaryModelDAO.readModelFromCsv(csv, "col1", "missed_column")
    }
  }

  test("csv file with non-valid numbers") {
    val csv = new StringReader("col1,col2\na,not_a_number")
    intercept[NumberFormatException] {
      WeightedDictionaryModelDAO.readModelFromCsv(csv, "col1", "col2")
    }
  }

  test("should correctly populate default dictionary") {
    withDao { dao =>
      dao.insertModel(
        new File("./src/main/defaults/default_model_coefficients.csv").getAbsoluteFile,
        new File("./src/main/defaults/default_weighted_dictionary.csv").getAbsoluteFile
      )

      val model = dao.readModel()

      model.isDefined shouldBe true

      model.get.threshold shouldBe 0.5
      model.get.intercept shouldBe 0.0

      model.get.words.size shouldBe 1371

      // First
      model.get.getWordCoefficient(":(") shouldBe Some(-1)
      // Something in the middle
      model.get.getWordCoefficient("mindless") shouldBe Some(-2)
      // Last
      model.get.getWordCoefficient("zealous") shouldBe Some(2)

      // Word not from the list
      model.get.getWordCoefficient("asdsalkjhdskjf") shouldBe None
    }
  }

  test("should be blank when db is empty") {
    withDao { dao =>
      dao.readModel() shouldBe None
    }
  }

  test("should fail on missed coefficients") {
    withCQLSession(cassandraKeyspace) { session =>
      val insertStmt = QueryBuilder.insertInto(cassandraModelTable)
        .value("id", WeightedDictionaryModelDAO.Id)
        .value("words", Map("abc" -> 1.0).asJava)
      session.execute(insertStmt)
    }

    withDao { dao =>
      intercept[IllegalStateException] {
        dao.readModel()
      }
    }
  }

  private def withDao(body: WeightedDictionaryModelDAO => Unit): Unit = {
    withCQLSession(cassandraKeyspace) { session =>
      val dao = new WeightedDictionaryModelDAO(session, cassandraModelTable)
      body(dao)
    }
  }
}

object WeightedDictionaryModelDAO_TestIT {
  private val cassandraKeyspace = "twitter_sentiment"
  private val cassandraModelTable = "model"
}
