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
package com.holdenkarau

import com.fasterxml.jackson.core.JsonParseException
import com.holdenkarau.spark.testing.StreamingActionBase
import org.apache.log4j.{Level, Logger}
import org.apache.spark.SparkException
import org.apache.spark.streaming.dstream.DStream
import org.junit.Assert._
import org.scalatest._

import scala.reflect.ClassTag


/**
 * com.holdenkarau package because of needlessly locked parent.
 * Note, that this helper tricks out spark clocks and input streams, that gives full control over micro-batches.
 * It perfectly fits needs of testing of something in the middle. But in case if test of real InputStream is needed,
 * then it is recommended to use self-established SparkContext.
 */
trait EmbeddedSparkHelper extends StreamingActionBase {
  self: Suite =>

  /**
   * Tests that spark streaming application fails due to a specified exception. Useful in some corner cases.
   */
  def assertSparkAppFailure[IN: ClassTag, OUT: ClassTag, ERR <: AnyRef](input: Seq[Seq[IN]], operation: DStream[IN] => DStream[OUT]): Unit = {
    val originalLogLevel = Logger.getLogger("org.apache.spark").getLevel
    Logger.getLogger("org.apache.spark").setLevel(Level.FATAL)

    try {
      val numBatches = input.size

      val err = intercept[SparkException] {
        withOutputAndStreamingContext(setupStreams[IN, OUT](input, operation)) { (outputStream, ssc) =>
          runStreams[OUT](outputStream, ssc, numBatches, numBatches + 1)
        }
      }
      assertTrue(err.getCause.isInstanceOf[JsonParseException])
    } finally {
      Logger.getLogger("org.apache.spark").setLevel(originalLogLevel)
    }
  }
}
