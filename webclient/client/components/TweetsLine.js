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

    this.state = { expanded: false };
    this.scrollPosition = 0;
  }

  componentWillUpdate() {
    var node = this.refs.tweetsList;
    // save scroll positions
    this.scrollState = {
      scrollTop: node.scrollTop,
      scrollHeight: node.scrollHeight
    };
  }

  componentDidUpdate() {
    // restore scroll position after adding tweet element
    if (this.scrollState.scrollTop) {
      var node = this.refs.tweetsList;
      var deltaHeight = node.scrollHeight - this.scrollState.scrollHeight;
      if (deltaHeight > 0) {
        node.scrollTop = this.scrollState.scrollTop + deltaHeight;
      }
    }
  }

  expandTweets() {
    let expanded = !this.state.expanded;
    let body = document.querySelector('body');

    if (!expanded) {
      this.refs.tweetsList.scrollTop = 0;
      body.style.overflow = 'scroll';
      body.scrollTop = this.scrollPosition;
    } else {
      let wrapper = document.querySelector('.wrapper');
      let scroll = body.scrollTop + wrapper.getBoundingClientRect().top;

      this.scrollPosition = body.scrollTop;
      body.scrollTop = scroll;
      body.style.overflow = 'hidden';
    }

    this.setState({
      expanded: expanded
    });
  }

  render() {
    const {
      tweets,
      waitingData
    } = this.props;

    const {
      expanded
    } = this.state;

    return (
      <div className={ expanded ? 'expanded' : '' }>
        <ul className="tweets-list" ref="tweetsList">
          { waitingData ?
            <li className="waiting-data">
              <div id="floatingBarsG">
                <div className="blockG" id="rotateG_01"></div>
                <div className="blockG" id="rotateG_02"></div>
                <div className="blockG" id="rotateG_03"></div>
                <div className="blockG" id="rotateG_04"></div>
                <div className="blockG" id="rotateG_05"></div>
                <div className="blockG" id="rotateG_06"></div>
                <div className="blockG" id="rotateG_07"></div>
                <div className="blockG" id="rotateG_08"></div>
              </div>
            </li> : tweets.map((tweet) => (
            <li
              key={ tweet.id }
              className={tweet.is_negative ? 'tweet-item negative' : 'tweet-item positive'}
            >
              <div className="tweet-title clearfix">
                <span className="tweet-icon"></span>
                <span className="tweet-user">@{ tweet.user }</span>
                <span className="tweet-date">{ moment(tweet.created).fromNow() }</span>
              </div>
              <span className="tweet-text">{ tweet.message }</span>
            </li>
          ))}
        </ul>
        <div className="expand-tweets" onClick={ this.expandTweets.bind(this) }></div>
      </div>
    );
  }
}

export default TweetsLine;
