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
  CALLBACK_NEW_MOVIE_DATA,
  SELECT_MOVIE,
  CALLBACK_FULL_MOVIE_DATA_STATISTIC,
  CLEAN_DATA
} from '../constants/ActionTypes';
import moment from 'moment';

/** firstData Object template for creating empty tweetStat*/
const firstData = {
  timestamp: moment().format('X'),
  period: 0,
  tweetCounterNegative: 0,
  tweetCounterPositive: 0,
  viewCounterNegative: 0,
  viewCounterPositive: 0,
  tweetCounterNegativeLow: 0,
  tweetCounterNegativeMiddle: 0,
  tweetCounterNegativeHigh: 0,
  tweetCounterPositiveLow: 0,
  tweetCounterPositiveMiddle: 0,
  tweetCounterPositiveHigh: 0
};

const initialState = {
  statistic: [Object.assign({}, firstData)],
  totalStatSum: Object.assign({}, firstData)
};

/**
 * Reducer with statistic for Real-time sentiments and with data for total live statistics
 * @param state
 * @param action
 * @returns {*}
 * @constructor
 */
export default function Statistic(state = initialState, action) {
  switch (action.type) {
    case CALLBACK_NEW_MOVIE_DATA:
      return Object.assign(
        {},
        state,
        {
          statistic: state.statistic.concat(action.payload)
        }
      );
    case CALLBACK_FULL_MOVIE_DATA_STATISTIC:
      return Object.assign(
        {},
        state,
        {
          totalStatSum: Object.assign(
            {},
            state.totalStatSum,
            {
              tweetCounterNegative: state.totalStatSum.tweetCounterNegative + action.payload.tweetCounterNegative,
              tweetCounterPositive: state.totalStatSum.tweetCounterPositive + action.payload.tweetCounterPositive
            }
          )
        }
      );

    case SELECT_MOVIE:
      return Object.assign({},
        state,
        {
          statistic: [Object.assign({},firstData,{timestamp:moment().format('X')})]
        }
      );

    case CLEAN_DATA:
      return Object.assign({}, state, {statistic: [Object.assign({},firstData,{timestamp:moment().format('X')})]});

    default:
      return state;
  }
}
