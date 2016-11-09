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

import com.griddynamics.blueprint.streaming.ClassificationModel
import org.junit.Assert._
import org.junit.runner.RunWith
import org.scalatest.{FunSuite, Matchers}
import org.scalatest.junit.JUnitRunner
import Matchers._

@RunWith(classOf[JUnitRunner])
class LogisticRegressionClassifierTest extends FunSuite {

  test("cutExceptions should cut words from exceptional dictionary") {
    val classifier = new LogisticRegressionClassifier(null)

    assertEquals((List(), "no no no"), classifier.cutExceptions("no no no", Array(":)")))
    assertEquals((List(":)", ":)"), "no no no"), classifier.cutExceptions("no :)no:) no", Array(":)")))
    assertEquals((List(":)", ":("), "no no no"), classifier.cutExceptions("no :)no no:(", Array(":)", ":(")))
    assertEquals((List("dont like"), "no :)no like no:("), classifier.cutExceptions("no dont like:)no like no:(", Array("dont like")))
  }

  test("removePunctuation should remove all non-letters") {
    val classifier = new LogisticRegressionClassifier(null)

    assertEquals("remove all of it ", classifier.removePunctuation("remove all of it: @#$%^&*(),.?/'\\\"\n\t\r"))
    assertEquals("remove underscores hyphens", classifier.removePunctuation("remove_underscores-hyphens"))
    assertEquals("merge many spaces ", classifier.removePunctuation("merge    many \tspaces \n"))
  }

  test("stemWord should work somehow") {
    val classifier = new LogisticRegressionClassifier(null)

    // stemming is done by external library, so we don't pay a lot of attention to test it
    assertEquals("love", classifier.stemWord("loves"))
    assertEquals("bore", classifier.stemWord("boring"))
  }

  test("removeDuplicates should work somehow") {
    val classifier = new LogisticRegressionClassifier(null)

    assertEquals(Set("word1", "word2"), classifier.removeDuplicates(Seq("word1", "word2", "word1")))
  }

  test("finally the whole parseWords pipeline should work") {
    val classifier = new LogisticRegressionClassifier(null)

    val parsed = classifier.parseWords("\"Star Wars\" is great, but very very boring ^_^", "Star Wars")

    Seq("is", "great", "but", "veri", "bore", "^_^").sorted should equal(parsed.sorted)
  }

  test("make decision should be based on threshold") {
    val classifier = new LogisticRegressionClassifier(ClassificationModel(0.5, 999.0, Map.empty))

    assertTrue(classifier.makeDecision(0.5 - 0.1))
    assertFalse(classifier.makeDecision(0.5 + 0.1))
    assertFalse(classifier.makeDecision(0.5))
  }

  test("logistic function should use dictionary and intercept") {
    val dictionary = ClassificationModel(999.0, 0.5, Map(
      "a" -> 1.0,
      "b" -> 2.0,
      "d" -> -4.0
    ))

    val classifier = new LogisticRegressionClassifier(dictionary)

    // exp(0.5)/(1+exp(0.5)) = 0.62245933
    assertEquals(0.62245933, classifier.applyLogisticFunction(Array[String]()), 0.0001)
    // t = 0.5 + 1 + 2 - 4 = -0.5
    // exp(t)/(1+exp(t)) = 0.37754067
    assertEquals(0.37754067, classifier.applyLogisticFunction(Array("a", "b", "c", "d")), 0.0001)
  }
}
