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

import com.griddynamics.blueprint.streaming.twitter.Tweet
import org.scalatest.{FunSuite, Matchers}

class TweetTest extends FunSuite with Matchers {
  test("Tweet.toJsonString should produce correct JSON") {
    val tweet = Tweet("test", "100", 1000050000L, "user", 10, "place", "geoloc", 0, "movie name")

    val bytes = tweet.toJsonBytes

    val expected = Tweet.JsonMapper.readValue[Tweet](bytes)
    tweet should equal(expected)
  }
}
