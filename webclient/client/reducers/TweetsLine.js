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
  CALLBACK_TWEETS_LINE,
  SELECT_POINT,
  RESET_POINT,
  GET_STREAM_TWEETS
} from '../constants/ActionTypes';

const initialState = {
  page_num: 0,
  pages: 0,
  tweets: [],
  fromTs: 0,
  toTs: 0,
  stream: true,
  waitingData: false
};

/**
 * Reducer with tweets messages
 * @param state
 * @param action
 * @returns {*}
 * @constructor
 */
export default function TweetsLine(state = initialState, action) {
  switch (action.type) {
    case CALLBACK_TWEETS_LINE: {
      let newState = {
        page_num: action.payload.page_num,
        pages: action.payload.pages,
        tweets: action.payload.tweets.concat(state.tweets)
      };
      if(!state.stream){
        newState.waitingData = false;
      }
      return Object.assign({},
        state,
        newState
      );
    }

    case SELECT_POINT:
      return Object.assign({},
        state,
        {fromTs: action.payload.fromTs},
        {toTs: action.payload.toTs},
        {stream: false},
        {waitingData: true}
      );

    case RESET_POINT:
      return Object.assign({},
        initialState
      );

    case GET_STREAM_TWEETS:
      return Object.assign({},
        initialState,
        {stream: action.payload}
      );

    default:
      return state;
  }
}
