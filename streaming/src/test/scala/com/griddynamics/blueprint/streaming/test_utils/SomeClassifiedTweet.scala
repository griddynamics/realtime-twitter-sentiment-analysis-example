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
package com.griddynamics.blueprint.streaming.test_utils

import com.griddynamics.blueprint.streaming.domain.{Tweet, ClassifiedTweet}

class SomeClassifiedTweet(withIsNegative: Boolean = SomeClassifiedTweet.default_isNegative,
                          withMovie: String = SomeClassifiedTweet.default_movie,
                          withTweet: Tweet = SomeClassifiedTweet.default_tweet)
  extends ClassifiedTweet(
    isNegative = withIsNegative,
    movie = withMovie,
    body = withTweet
  ) {}

object SomeClassifiedTweet {
  val default_isNegative = false
  val default_movie = SomeTweetAndMovie.default_movie
  val default_tweet = new SomeTweet()
}
