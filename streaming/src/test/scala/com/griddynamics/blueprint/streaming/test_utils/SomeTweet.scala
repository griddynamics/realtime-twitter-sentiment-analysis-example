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

import com.griddynamics.blueprint.streaming.domain.Tweet

class SomeTweet(withMessage: String = SomeTweet.default_message,
                withMovie: String = SomeTweet.default_movie,
                withId: String = SomeTweet.default_id,
                withCreated: Long = SomeTweet.default_created,
                withUser: String = SomeTweet.default_user,
                withFollowers: Int = SomeTweet.default_followers,
                withPlaceName: String = SomeTweet.default_placeName,
                withGeoLocation: String = SomeTweet.default_geoLocation,
                withUtcOffset: Int = SomeTweet.default_utcOffset)
  extends Tweet(
    id = withId,
    user = withUser,
    created = withCreated,
    message = withMessage,
    followers = withFollowers,
    placeName = withPlaceName,
    geoLocation = withGeoLocation,
    utcOffset = withUtcOffset
  ) {}

object SomeTweet {
  val default_message = "some message"
  val default_movie = "some movie"
  val default_id = "some id"
  val default_created = 123
  val default_user = "some user"
  val default_followers = 1
  val default_placeName = "some place"
  val default_geoLocation = "some location"
  val default_utcOffset = 3
}