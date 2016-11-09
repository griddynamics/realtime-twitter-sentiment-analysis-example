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
package com.griddynamics.blueprint.streaming.test

import java.io.File
import java.util.{Properties, UUID}

import kafka.consumer.{Consumer, ConsumerConfig}
import kafka.serializer.{Decoder, StringDecoder}
import kafka.server.{KafkaConfig, KafkaServer}
import kafka.utils.{SystemTime, TestUtils, ZKStringSerializer}
import org.I0Itec.zkclient.ZkClient
import org.apache.commons.io.FileUtils
import org.apache.kafka.clients.producer.{KafkaProducer, ProducerRecord}
import org.apache.kafka.common.serialization.{Serializer, StringSerializer}
import org.scalatest.Suite
import org.slf4j.LoggerFactory

import scala.collection.JavaConverters._

trait EmbeddedKafkaHelper extends EmbeddedZookeeperHelper {
  self: Suite =>

  private val logger = LoggerFactory.getLogger(classOf[EmbeddedKafkaHelper])

  val kafkaHost = "localhost"
  val kafkaPort = scala.util.Properties.propOrElse("kafka.reserved.port", "19092")
  val kafkaTempDir = new File("./target/kafka")

  private var kafkaServer: KafkaServer = _

  override def beforeAll(): Unit = {
    super.beforeAll()

    val props = new Properties

    props.setProperty("zookeeper.connect", s"$zkHost:$zkPort")
    props.setProperty("broker.id", String.valueOf(1))
    props.setProperty("host.name", kafkaHost)
    props.setProperty("port", kafkaPort)
    props.setProperty("log.dir", kafkaTempDir.getAbsolutePath)
    props.setProperty("log.flush.interval.messages", String.valueOf(1))

    logger.info(s"Starting embedded Kafka on port $kafkaPort")

    FileUtils.deleteDirectory(kafkaTempDir)
    kafkaTempDir.mkdir()
    kafkaServer = new KafkaServer(new KafkaConfig(props), SystemTime)
    kafkaServer.startup()
  }

  override def afterAll(): Unit = {
    logger.info("Stopping embedded Kafka")

    if (kafkaServer != null) kafkaServer.shutdown()

    super.afterAll()
  }


  /**
    * Creates a topic with the specified name. By default Kafka auto creates topics when a message is sent.
    *
    * @param topic topic name
    */
  def createTopic(topic: String): Unit = {
    sendMessage(topic, "")
  }

  def sendMessage(topic: String, message: String): Unit = {
    val props: Properties = new Properties
    props.put("bootstrap.servers", s"$kafkaHost:$kafkaPort")
    props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer")
    props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer")
    val producer = new KafkaProducer[String, String](props)

    val record = new ProducerRecord[String, String](topic, UUID.randomUUID().toString, message)

    producer.send(record).get

    producer.close()
  }

  def withProducer[V](topic: String, valSerializer: Serializer[V])(body: KafkaProducer[String, V] => Unit): Unit = {
    val props: Properties = new Properties
    props.put("bootstrap.servers", s"$kafkaHost:$kafkaPort")
    val producer = new KafkaProducer[String, V](props, new StringSerializer, valSerializer)
    try {
      body(producer)
    } finally {
      producer.close()
    }
  }

  def withConsumed[V](msgNumber: Int, topic: String, valDecoder: Decoder[V])(body: IndexedSeq[V] => Unit): Unit = {
    val consumerGroup = "group0"
    val consumerProperties = TestUtils.createConsumerProperties(zkConnectString, consumerGroup, "consumer0", 5000)
    val zkClient = new ZkClient(zkConnectString, 30000, 30000, ZKStringSerializer)
    val consumer = Consumer.createJavaConsumerConnector(new ConsumerConfig(consumerProperties))

    // see https://stackoverflow.com/questions/14935755/how-to-get-data-from-old-offset-point-in-kafka
    logger.info("Deleting ZooKeeper information to make sure the consumer starts from the beginning")
    zkClient.delete("/consumers/" + consumerGroup)

    // starting consumer
    val topicCountMap = mapAsJavaMapConverter(Map(topic -> new Integer(1))).asJava
    val consumerMap = consumer.createMessageStreams(topicCountMap, new StringDecoder(), valDecoder)
    val stream = consumerMap.get(topic).get(0)
    val iterator = stream.iterator()

    try {
      val consumed = for {
        _ <- 1 to msgNumber
      } yield iterator.next().message()
      body(consumed)
    } finally {
      consumer.shutdown()
    }
  }
}
