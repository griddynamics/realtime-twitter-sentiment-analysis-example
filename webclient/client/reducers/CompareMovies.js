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
  CALLBACK_COMPARE_MOVIE_DATA,
  SELECT_MOVIES,
  SELECT_CHART_TYPE
} from '../constants/ActionTypes';

const initialState = {
  selectedMovies: [],
  movieDataMap: {},
  selectedChartType: 'line_all'
};

/**
 * Reducer with comparing data for selected movies
 * @param state
 * @param action
 * @returns {*}
 * @constructor
 */
export default function CompareMovies(state = initialState, action) {
  switch (action.type) {
    case SELECT_MOVIES:
      return Object.assign({}, state, {selectedMovies: action.payload});

    case CALLBACK_COMPARE_MOVIE_DATA:
      return Object.assign({}, state, {movieDataMap: action.payload});

    case SELECT_CHART_TYPE:
      return Object.assign({}, state, {selectedChartType: action.payload});

    default:
      return state;
  }
}
