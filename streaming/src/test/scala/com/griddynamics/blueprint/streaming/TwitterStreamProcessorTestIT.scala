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

import com.fasterxml.jackson.core.JsonParseException
import com.griddynamics.blueprint.streaming.classifier.{LogisticRegressionClassifierFactory, ClassificationModelCache}
import com.griddynamics.blueprint.streaming.domain.{ClassifiedTweet, Tweet, TweetAndMovie}
import com.griddynamics.blueprint.streaming.test_utils.{SomeTweet, SomeTweetAndMovie}
import com.holdenkarau.EmbeddedSparkHelper
import org.apache.spark.streaming.dstream.DStream
import org.junit.runner.RunWith
import org.scalatest.FunSuite
import org.scalatest.junit.JUnitRunner

@RunWith(classOf[JUnitRunner])
class TwitterStreamProcessorTestIT extends FunSuite with EmbeddedSparkHelper {

  test("valid JSON stream should be correctly deserialized") {
    // Given: a dummy classifier and valid JSON input
    val processor: TwitterStreamProcessor = new DummyTwitterStreamProcessor()
    val input = Seq(Seq((
      "ignored",
      """
    {
      "text": "some text",
      "id": "id1",
      "timestamp": 12345,
      "user": "user1",
      "followers": 5,
      "placeName": "place1",
      "geoLocation": "location1",
      "utcOffset": 3,
      "movieName": "movie1"
    }
      """)))

    // When: I parse JSON input, I should receive correctly parsed events
    val expected = Seq(Seq(new TweetAndMovie(
      movie = "movie1",
      Tweet(
        message = "some text",
        id = "id1",
        created = 12345,
        user = "user1",
        followers = 5,
        placeName = "place1",
        geoLocation = "location1",
        utcOffset = 3)
    )))
    testOperation[(String, String), TweetAndMovie](input, (x: DStream[(String, String)]) => processor.parseJSON(x), expected)
  }

  test("invalid JSON should fail the app") {
    // Given: a dummy classifier and valid JSON input
    val processor: TwitterStreamProcessor = new DummyTwitterStreamProcessor()
    val input = Seq(Seq(("ignored", "{ invalid JSON }")))

    // When: I parse JSON input, I should receive correctly parsed events
    assertSparkAppFailure[(String, String), TweetAndMovie, JsonParseException](input, (x: DStream[(String, String)]) => processor.parseJSON(x))
  }

  test("tweets should be classified") {
    // Given: a stream from positive and negative tweets
    val positiveTweet = new SomeTweetAndMovie(withTweet = new SomeTweet(withMessage = "superpositiveword"))
    val negativeTweet = new SomeTweetAndMovie(withTweet = new SomeTweet(withMessage = "supernegativeword"))

    val input: Seq[Seq[TweetAndMovie]] = Seq(Seq(positiveTweet, negativeTweet))

    // When: I classify the stream, I should get valid classification results
    val processor = new TwitterStreamProcessor(
      new LogisticRegressionClassifierFactory(
        new HardcodedDictionaryCache(
          Map("superpositiveword" -> 5.0, "supernegativeword" -> -5.0),
          threshold = 0.5,
          intercept = 0.0)
      )
    )

    val expected = Seq(Seq(new ClassifiedTweet(false, positiveTweet), new ClassifiedTweet(true, negativeTweet)))
    testOperation[TweetAndMovie, ClassifiedTweet](input, (x: DStream[TweetAndMovie]) => processor.classify(x), expected)
  }
}

private class HardcodedDictionaryCache(dict: Map[String, Double] = Map.empty,
                                       threshold: Double = 1.0,
                                       intercept: Double = 1.0) extends ClassificationModelCache {
  override val getModel = ClassificationModel(threshold, intercept, dict)
}

private class DummyTwitterStreamProcessor extends TwitterStreamProcessor(
  new LogisticRegressionClassifierFactory(
    new HardcodedDictionaryCache()
  )
)



