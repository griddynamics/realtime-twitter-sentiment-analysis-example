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
import {connect} from 'react-redux';
import moment from 'moment';
import {DATE_DAY_TIME_TEXT} from '../constants/Variable';

/**
 * LiveStatistic component for rendering Totel live statistic panel on bottom page
 */
class LiveStatistic extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    var {totalStatSum} = this.props;
    return (
      <div className="statistic-1">
        <label className="statistic-title">Total tweets received starting {moment(totalStatSum.timestamp,'X').format(DATE_DAY_TIME_TEXT)}: </label>
        <div className="rts-line"><span className="positive-count">positive:</span> {totalStatSum.tweetCounterPositive}</div>
        <div className="rts-line"><span className="negative-count">negative:</span> {totalStatSum.tweetCounterNegative}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    totalStatSum: state.statistic.totalStatSum
  };
}

export default connect(
  mapStateToProps
)(LiveStatistic);
