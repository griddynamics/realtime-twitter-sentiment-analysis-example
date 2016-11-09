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
package com.griddynamics.blueprint.streaming.domain

import org.joda.time.{DateTime, DateTimeZone}

/**
 * The class represents information received from twitter search.
 * See implementation of twitter4j.Status interface for more details.
 */
case class Tweet(id: String,
                 user: String,
                 created: Long,
                 message: String,
                 followers: Int,
                 placeName: String,
                 geoLocation: String,
                 utcOffset: Int) {
  def createdAtUtc: DateTime = {
    new DateTime(created, DateTimeZone.UTC)
  }
}



