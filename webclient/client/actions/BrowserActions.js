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
import { MOBILE_WIDTH } from '../constants/Variable.js';
import { callbackViewportChanged } from './PageActions';

var state = {};
var store = null;

export function init(){
  var mediaList = {
    isMobile: {
      mq: `(max-width: ${MOBILE_WIDTH})`
    },
    isLandscape: {
      mq: '(orientation:landscape)'
    },
    isSquareScreen: {
      mq: '(min-aspect-ratio: 1/1)'
    },
    isHandheld: {
      mq: 'handheld'
    },
    isScreen: {
      mq: 'screen'
    }
  };
  var mqls = {};

  for (var key in mediaList) {
    mqls[key] = matchMedia(mediaList[key].mq);
    state[key] = mqls[key].matches;
    mqls[key].addListener(createProcessEvent(key));
  }

  return state;

  function createProcessEvent(key) {
    return function processEvent(event) {
      state[key] = event.matches;
      store.dispatch(callbackViewportChanged(state,key));
    }
  }
}

export function setStore(storeObj) {
  store = storeObj;
}
