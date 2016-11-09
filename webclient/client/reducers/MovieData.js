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
import {
  CALLBACK_MOVIE_DATA,
  CLEAN_DATA
} from '../constants/ActionTypes';

const initialState = [];

/**
 * Reducer with historical data for selected movie
 * @param state
 * @param action
 * @returns {*}
 * @constructor
 */
export default function MovieData(state = initialState, action) {
  switch (action.type) {
    case CALLBACK_MOVIE_DATA:
      return [].concat(action.payload);

    case CLEAN_DATA:
      return [];

    default:
      return state;
  }
}

