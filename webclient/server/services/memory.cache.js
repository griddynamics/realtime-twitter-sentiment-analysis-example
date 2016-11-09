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
'use strict';

var instance = null;
var autoCleanerMap = {};
var store = {};

/**
 * Singleton for caching data in memory
 */
class MemoryCache {
  constructor() {
    if (!instance) {
      instance = this;
    }

    return instance;
  }

  static getInstance() {
    return new MemoryCache();
  }

  /**
   * Read value from memory, and addTTL
   * @param key
   * @param addTTL integer add time to live in seconds
   * @returns {Promise.<*>}
     */
  getValue(key, addTTL) {
    if (addTTL == undefined) {
      addTTL = 0;
    }
    this.updateAutoClean(key, addTTL);
    return Promise.resolve(store[key]);
  }

  /**
   * Save value to memory
   * @param key string
   * @param value
   * @param TTL integer time to live in seconds
     */
  setValue(key, value, TTL) {
    if (TTL == undefined) {
      TTL = 10;
    }
    this.updateAutoClean(key, TTL);
    store[key] = value;
  }

  /**
   * Function for updating TTL observer
   * @param key
   * @param TTL
     */
  updateAutoClean(key, TTL) {
    if (autoCleanerMap[key]) {
      clearTimeout(autoCleanerMap[key].timeoutId);
    }
    if (autoCleanerMap[key] == undefined) {
      autoCleanerMap[key] = {ttl: 0, timeoutId: 0};
    }
    autoCleanerMap[key].ttl += TTL;
    autoCleanerMap[key].timeoutId = setTimeout(
      this.generateRemoveFunction(key),
      autoCleanerMap[key].ttl * 1000
    );

  }

  generateRemoveFunction(key) {
    return function () {
      delete autoCleanerMap[key];
      delete store[key];
    };
  }
}

module.exports = MemoryCache;
