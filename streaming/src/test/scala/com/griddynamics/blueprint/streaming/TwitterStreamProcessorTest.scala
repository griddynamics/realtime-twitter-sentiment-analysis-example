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

import com.griddynamics.blueprint.streaming.domain.TweetAndMovie
import org.junit.Assert._
import org.junit.runner.RunWith
import org.scalatest.FunSuite
import org.scalatest.junit.JUnitRunner

@RunWith(classOf[JUnitRunner])
class TwitterStreamProcessorTest extends FunSuite {

  test("RawTweetJSONParser should parse valid JSON well") {
    val result: TweetAndMovie = RawTweetJSONParser.fromJson(
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
      """)
    assertNotNull(result)
    assertEquals("some text", result.tweet.message)
    assertEquals("id1", result.tweet.id)
    assertEquals(12345, result.tweet.created)
    assertEquals("user1", result.tweet.user)
    assertEquals(5, result.tweet.followers)
    assertEquals("place1", result.tweet.placeName)
    assertEquals("location1", result.tweet.geoLocation)
    assertEquals(3, result.tweet.utcOffset)
  }


  test("RawTweetJSONParser should throw exception on malformed JSON") {
    intercept[Exception] {
      RawTweetJSONParser.fromJson( """{"item_id":"abc123","amount":1.23,"time":1431504603105}""")
    }
  }
}
