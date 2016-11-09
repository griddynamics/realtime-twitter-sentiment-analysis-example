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

import java.io.{File, FileReader, IOException, Reader}
import java.lang.{Double => JDouble}

import com.datastax.driver.core.Session
import com.datastax.driver.core.querybuilder.QueryBuilder
import com.github.tototoshi.csv.CSVReader
import com.google.common.annotations.VisibleForTesting

import scala.collection.JavaConverters._

/**
  * DAO layer for weighted dictionary and coefficients.
  * Since dictionary is lightweight, it stores both words and coefficients in a single Cassandra table row
  * to be able to read in entirely with single select.
 */
class WeightedDictionaryModelDAO(session: Session, table: String) {

  import WeightedDictionaryModelDAO._

  def insertModel(coefficientsFile: File, dictionaryFile: File): Unit = {
    val coeffs = readModelFromCsv(coefficientsFile, "name", "value")
    val words = readModelFromCsv(dictionaryFile, "word", "weight")
    val insertStmt = QueryBuilder.insertInto(table)
      .value("id", Id)
      .value("intercept", coeffs(InterceptName))
      .value("threshold", coeffs(ThresholdName))
      .value("words", words.asJava)
    session.execute(insertStmt)
  }

  def readModel(): Option[ClassificationModel] = {
    val select = QueryBuilder.select().all().from(table).where(QueryBuilder.eq("id", Id))
    val rs = session.execute(select)
    for (row <- Option(rs.one())) yield {
      def getRequiredDouble(name: String): Double = {
        val res = row.get(name, classOf[JDouble])
        if (res == null) {
          throw new IllegalStateException(
            s"Required key '$name' was not found in Cassandra. Make sure you've populated it correctly.")
        }
        res
      }

      val threshold = getRequiredDouble("threshold")
      val intercept = getRequiredDouble("intercept")
      val words = row.getMap("words", classOf[String], classOf[JDouble])
      new ClassificationModel(threshold, intercept, words)
    }
  }
}

object WeightedDictionaryModelDAO {
  private[streaming] val Id = "id"
  private[streaming] val InterceptName = "intercept"
  private[streaming] val ThresholdName = "threshold"

  private def readModelFromCsv(csv: File, keyColumn: String, valueColumn: String): Map[String, Double] = {
    readModelFromCsv(new FileReader(csv), keyColumn, valueColumn)
  }

  @VisibleForTesting
  private[streaming] def readModelFromCsv(csv: Reader, keyColumn: String, valueColumn: String): Map[String, Double] = {
    val reader = CSVReader.open(csv)
    val res = Map.newBuilder[String, Double]
    for (line <- reader.iteratorWithHeaders) {
      val key = line.get(keyColumn)
      val value = line.get(valueColumn)
      if (key.isEmpty || value.isEmpty) {
        throw new IOException(s"At least one of '$keyColumn' or '$valueColumn' not found")
      }
      var valueAsDouble = 0.0
      try {
        valueAsDouble = value.get.toDouble
      } catch {
        case e: NumberFormatException =>
          throw new NumberFormatException(s"Cannot parse '${value.get}' to double in column $valueColumn at line $line")
      }
      res += key.get -> valueAsDouble
    }
    res.result()
  }
}
