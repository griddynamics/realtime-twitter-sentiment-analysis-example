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
  CALLBACK_VIEWPORT_CHANGED
} from '../constants/ActionTypes';
import * as browserActions from './../actions/BrowserActions';

var state = browserActions.init();

const initialState = Object.assign({},state);

export default function Viewport(state = initialState, action) {
  if(action.type == CALLBACK_VIEWPORT_CHANGED){
    return Object.assign({},
      action.payload
    );
  }else{
    return state;
  }
}


