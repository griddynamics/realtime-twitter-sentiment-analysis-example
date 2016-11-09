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

import java.util.concurrent.atomic.AtomicReference
import java.util.concurrent.{Executors, TimeUnit}

import com.datastax.driver.core.{Cluster, SocketOptions}
import com.griddynamics.blueprint.streaming.{ClassificationModel, WeightedDictionaryModelDAO}

case class CassandraClassificationModelCache(cassandraHost: String,
                                             cassandraPort: Int,
                                             cassandraKeyspace: String,
                                             modelTable: String,
                                             updatePeriodSec: Long) extends ClassificationModelCache {

  import CassandraClassificationModelCache._

  def getModel = modelLoader(this).model
}

private object CassandraClassificationModelCache {

  // TODO: remove after conversion to Java 1.8
  private implicit class RichAtomicReference[V](reference: AtomicReference[V]) {
    // copied from AtomicReference
    def ourUpdateAndGet(updateFunction: V => V): V = {
      var prev = null.asInstanceOf[V]
      var next = null.asInstanceOf[V]
      do {
        prev = reference.get()
        next = updateFunction.apply(prev)
      } while (!reference.compareAndSet(prev, next))
      next
    }
  }

  private[this] val modelLoaderHolder = new AtomicReference[ModelLoader]

  private def modelLoader(cache: CassandraClassificationModelCache): ModelLoader = {
    modelLoaderHolder.ourUpdateAndGet(t => Option(t) getOrElse new ModelLoader(cache))
  }

  /**
    * Loads classification model and reloads it every `updatePeriodSec` seconds.
    */
  private class ModelLoader(cache: CassandraClassificationModelCache) {

    @volatile var model = readModel().getOrElse(throw new IllegalStateException("Can't read classification model."))

    Executors.newSingleThreadScheduledExecutor().scheduleAtFixedRate(new Runnable {
      override def run(): Unit = {
        model = readModel().getOrElse(throw new IllegalStateException("Can't read classification model."))
      }
    }, cache.updatePeriodSec, cache.updatePeriodSec, TimeUnit.SECONDS)

    private def readModel(): Option[ClassificationModel] = {
      val cluster = Cluster.builder
        .addContactPoint(cache.cassandraHost)
        .withPort(cache.cassandraPort)
        .withSocketOptions(new SocketOptions().setConnectTimeoutMillis(10000).setReadTimeoutMillis(20000))
        .build()

      val session = cluster.connect(cache.cassandraKeyspace)

      try {
        val dao = new WeightedDictionaryModelDAO(session, cache.modelTable)
        dao.readModel()
      } finally {
        session.close()
        cluster.close()
      }
    }
  }

}