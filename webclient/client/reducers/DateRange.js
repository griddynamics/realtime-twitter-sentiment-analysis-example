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
import { SELECT_PERIOD } from '../constants/ActionTypes';
import moment from 'moment';

const now = moment();

now.locale('en-gb');

const fromDate = now.clone().subtract(1, 'week').startOf('day');
const toDate = now.clone().endOf('day');

const initialState = [
  fromDate,
  toDate
];

/**
 * Reducer with a range of selected dates
 * @param state
 * @param action
 * @returns {*[]}
 */
export default function dateRange(state = initialState, action) {
  switch (action.type) {
    case SELECT_PERIOD:
      return action.payload;

    default:
      return state;
  }
}
