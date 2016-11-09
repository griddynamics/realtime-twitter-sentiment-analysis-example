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
  CALLBACK_GET_MOVIES_LIST,
  SELECT_MOVIE
} from '../constants/ActionTypes';

const initialState = {
  movies: [],
  selected: ''
};

/**
 * Reducer with list of movies
 * @param state
 * @param action
 * @returns {*}
 */
export default function movieList(state = initialState, action) {
  switch (action.type) {
    case CALLBACK_GET_MOVIES_LIST:
      return Object.assign({}, state, {movies: action.payload, selected: action.payload[0].id});

    case SELECT_MOVIE:
      return Object.assign({}, state, {selected: action.payload});

    default:
      return state;
  }
}

