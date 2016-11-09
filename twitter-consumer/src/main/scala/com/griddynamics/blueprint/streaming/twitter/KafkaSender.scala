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
package com.griddynamics.blueprint.streaming.twitter

import org.apache.kafka.clients.producer.{KafkaProducer, ProducerRecord}
import org.slf4j.LoggerFactory

class KafkaSender[K, V](kafkaProducer: KafkaProducer[K, V], topicName: String) {
  import com.griddynamics.blueprint.streaming.twitter.KafkaSender.logger

  def send(tweet: V): Unit = {
    logger.debug("Sending to Kafka: {}", tweet)
    kafkaProducer.send(new ProducerRecord[K, V](topicName, tweet))
  }
}

object KafkaSender {
  val logger = LoggerFactory.getLogger(KafkaSender.getClass)
}
