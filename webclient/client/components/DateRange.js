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

import 'rc-calendar/assets/index.css';
import RangeCalendar from 'rc-calendar/lib/RangeCalendar';
import SingleRangeCalendar from '../vendor/rc-calendar/SingleRangeCalendar';
import Picker from 'rc-calendar/lib/Picker';
import 'rc-time-picker/assets/index.css';

import enUS from 'rc-calendar/lib/locale/en_US';
import 'rc-time-picker/assets/index.css';

import moment from 'moment';
import 'moment/locale/en-gb';

import { DATE_SHORT } from '../constants/Variable';

/**
 * Formatting date
 * @param  {moment Object} v
 * @return {String}
 */
function format(v) {
  return v ? v.format(DATE_SHORT) : '';
}

/**
 * Check date to valid
 * @param  {Array}  v
 * @return {Boolean}
 */
function isValidRange(v) {
  return v && v[0] && v[1];
}

/**
 * DateRange component for render calendar
 */
class DateRange extends Component {
  constructor(props, context) {
    super(props, context);
  }

/**
 * Disable date range for select
 * @param  {moment Object} current
 * @return {moment Object}
 */
  disabledDate(current) {
    const date = moment().endOf('day');

    return current.isAfter(date);
  }

/**
 * This method called action select date period
 * @param  {moment Object} value
 */
  onChange(value) {
    value[1].endOf('day');
    this.props.selectPeriod(value);
  }

  render() {
    let {dateRange,viewport} = this.props;

    let calendar = (
      <RangeCalendar
        dateInputPlaceholder={ ['start', 'end'] }
        locale={ enUS }
        showOk={ true }
        format={ DATE_SHORT }
        disabledDate={ this.disabledDate }
      />
    );
    if(viewport.isMobile){
      calendar = (
        <SingleRangeCalendar
          dateInputPlaceholder={ ['start', 'end'] }
          locale={ enUS }
          showOk={ true }
          format={ DATE_SHORT }
          disabledDate={ this.disabledDate }
        />
      )
    }

    return (
      <Picker
        animation="slide-up"
        calendar={ calendar }
        value={ dateRange }
        onChange={ this.onChange.bind(this) }
      >
        {
          ({value}) => {
            return (
              <div className="date-picker">
                <div className="input">
                  <span className="time-range">
                    {isValidRange(value) && `${format(value[0])} / ${format(value[1])}` || ''}
                  </span>
                  <div className="calendar-icon" title="Open calendar"></div>
                </div>
              </div>
            );
          }
        }
      </Picker>
    );
  }
}
function mapStateToProps(state) {
  return {
    viewport: state.viewport
  };
}

export default connect(
  mapStateToProps
)(DateRange);
