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

import java.lang.{Double => JDouble}
import java.util.{Map => JMap}

import scala.collection.JavaConversions._

case class ClassificationModel(threshold: Double, intercept: Double, words: Map[String, Double]) {

  def this(threshold: Double, intercept: Double, words: JMap[String, JDouble]) {
    this(threshold, intercept, words.mapValues(_.doubleValue).toMap)
  }

  def getWordCoefficient(word: String): Option[Double] = {
    words.get(word)
  }
}
