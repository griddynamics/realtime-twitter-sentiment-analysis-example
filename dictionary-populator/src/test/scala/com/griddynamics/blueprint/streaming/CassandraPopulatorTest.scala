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

import com.datastax.driver.core.Session
import com.typesafe.config.ConfigFactory
import org.mockito.{Matchers, Mockito}
import org.scalatest.FunSuite
import org.scalatest.mock.MockitoSugar

import scala.collection.JavaConversions._

class CassandraPopulatorTest extends FunSuite {
  test("Configuration options should be correctly propagated") {
    // Given: configuration and mocked/spied external logic
    val props = Map(
      "populator.cassandra.host" -> "host",
      "populator.cassandra.port" -> 123,
      "populator.cassandra.schema.keyspace" -> "keyspace",
      "populator.cassandra.schema.model_table" -> "table",
      "populator.model.dictionary_file" -> "dictionary.file",
      "populator.model.coefficients_file" -> "coefficients.file"
    )

    val config = ConfigFactory.parseMap(props)
    val daoMock = MockitoSugar.mock[WeightedDictionaryModelDAO]
    val appSpy = Mockito.spy(new CassandraPopulator())
    Mockito.doReturn(null).when(appSpy).connectToCassandra("host", 123, "keyspace")
    Mockito.doReturn(daoMock).when(appSpy).getDAO(Matchers.anyObject[Session](), "table")

    // When: I run the application
    appSpy.run(config)

    // Then: Underlying logic should be called with proper arguments from configuration
    Mockito.verify(appSpy).connectToCassandra("host", 123, "keyspace")
    Mockito.verify(daoMock).insertModel(new File("coefficients.file"), new File("dictionary.file"))
  }
}
