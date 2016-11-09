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
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import {
  DATE_TIME,
  DATE_MONTH
} from '../constants/Variable';

/**
 * TweetsLine component for rendering tweet messages
 */
class TweetsLine extends Component {

  constructor(props, context) {
    super(props, context);
  }

  componentWillUpdate() {
    var node = ReactDOM.findDOMNode(this);
    // save scroll positions
    this.scrollState = {
      scrollTop: node.scrollTop,
      scrollHeight: node.scrollHeight
    };
  }

  componentDidUpdate() {
    // restore scroll position after adding tweet element
    if(this.scrollState.scrollTop){
      var node = ReactDOM.findDOMNode(this);
      var deltaHeight = node.scrollHeight - this.scrollState.scrollHeight;
      if(deltaHeight > 0){
        node.scrollTop = this.scrollState.scrollTop + deltaHeight;
      }
    }
  }

  render() {
    const {
      tweets,
      waitingData
    } = this.props;

    return (
      <ul className="tweets-list">
        {waitingData ? <li className="waiting-data"><div id="floatingBarsG">
          <div className="blockG" id="rotateG_01"></div>
          <div className="blockG" id="rotateG_02"></div>
          <div className="blockG" id="rotateG_03"></div>
          <div className="blockG" id="rotateG_04"></div>
          <div className="blockG" id="rotateG_05"></div>
          <div className="blockG" id="rotateG_06"></div>
          <div className="blockG" id="rotateG_07"></div>
          <div className="blockG" id="rotateG_08"></div>
        </div></li> : tweets.map((tweet) => (
          <li
            key={ tweet.id }
            className={tweet.is_negative ? 'tweet-item negative' : 'tweet-item positive'}
          >
            <span className="tweet-text">{ tweet.message }</span>
            <span className="tweet-user">
              <span className="tweet-date">
                  { moment(tweet.created).format(DATE_MONTH) + ' at ' +
                  moment(tweet.created).format(DATE_TIME) }
              </span>
              @{ tweet.user}
            </span>
          </li>
        ))}
      </ul>
    );
  }
}

export default TweetsLine;
