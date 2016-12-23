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
import moment from 'moment';
import {DATE_DAY_TIME} from '../constants/Variable';

/**
 * TweetsFilter component for rendering filter satate
 * filter state can be live stream or specified period
 */
class TweetsFilter extends Component {

  constructor(props, context) {
    super(props, context);
  }

  resetPoint() {
    this.props.resetPoint();
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.stream !== this.props.stream
      || nextProps.selectFilter.fromTs !== this.props.selectFilter.fromTs;
  }

  render() {
    const {
      selectFilter,
      stream
    } = this.props;

    let filterLabel = '';

    if (stream) {
      filterLabel = <span className="tweets-filter-label">stream</span>;
    } else {
      filterLabel = <div>
        <span className="tweets-filter-label">
          { moment(selectFilter.fromTs, 'X').format(DATE_DAY_TIME) } / { moment(selectFilter.toTs, 'X').format(DATE_DAY_TIME) }
        </span>
        <div className="tweets-filter-reset" title="Reset point" onClick={ this.resetPoint.bind(this) }></div>
      </div>;
    }

    return (
      <div className="tweets-filter">
        { filterLabel }
      </div>
    );
  }
}

export default TweetsFilter;
