/**
 * The MIT License (MIT)
 * Copyright (c) 2014-present yiminghe
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject
 * to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
 * ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
 * SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
 * THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import React, { PropTypes } from 'react';
import CalendarHeader from 'rc-calendar/lib/calendar/CalendarHeader';
import DateTable from 'rc-calendar/lib/date/DateTable';
import DateInput from 'rc-calendar/lib/date/DateInput';
import { getTimeConfig } from 'rc-calendar/lib/util/index';
import moment from 'moment';

const CalendarPart = React.createClass({
  propTypes: {
    fromValue: PropTypes.any,
    toValue: PropTypes.any,
    direction: PropTypes.any,
    prefixCls: PropTypes.any,
    locale: PropTypes.any,
    selectedValue: PropTypes.any,
    hoverValue: PropTypes.any,
    showTimePicker: PropTypes.bool,
    format: PropTypes.any,
    placeholder: PropTypes.any,
    disabledDate: PropTypes.any,
    timePicker: PropTypes.any,
    disabledTime: PropTypes.any,
    onInputSelect: PropTypes.func,
    timePickerDisabledTime: PropTypes.object,
  },
  render() {
    const props = this.props;
    const {
      fromValue, toValue, direction, prefixCls,
      locale, selectedValue, format, placeholder,
      disabledDate, timePicker, disabledTime,
      timePickerDisabledTime, showTimePicker,
      hoverValue, onInputSelect,
      } = props;
    const disabledTimeConfig = showTimePicker && disabledTime && timePicker ?
      getTimeConfig(selectedValue, disabledTime) : null;
    const rangeClassName = `${prefixCls}-range`;
    const newProps = {
      locale: locale,
      value: fromValue,
      prefixCls: prefixCls,
      showTimePicker: showTimePicker,
    };
    const index = direction === 'left' ? 0 : 1;
    const timePickerEle = showTimePicker && timePicker &&
      React.cloneElement(timePicker, {
        showHour: true,
        showMinute: true,
        showSecond: true,
        ...timePicker.props,
        ...disabledTimeConfig,
        ...timePickerDisabledTime,
        onChange: onInputSelect,
        defaultOpenValue: fromValue,
        value: selectedValue[index],
      });
    return (
      <div className={`${rangeClassName}-part ${rangeClassName}-${direction}`}>
        <div className="rc-calendar-input-wrap">
          <div className="rc-calendar-date-input-wrap">
            {fromValue.format(format)} ~ {toValue.format(format)}
          </div>
        </div>
        <div style={{ outline: 'none' }}>
          <CalendarHeader
            {...newProps}
            enableNext={true}
            enablePrev={true}
            onValueChange={props.onValueChange}
          />
          {showTimePicker ? <div className={`${prefixCls}-time-picker`}>
            <div className={`${prefixCls}-time-picker-panel`}>
              {timePickerEle}
            </div>
          </div> : null}
          <div className={`${prefixCls}-body`}>
            <DateTable
              {...newProps}
              hoverValue={hoverValue}
              selectedValue={selectedValue}
              dateRender={props.dateRender}
              onSelect={props.onSelect}
              onDayHover={props.onDayHover}
              disabledDate={disabledDate}
              showWeekNumber={props.showWeekNumber}
            />
          </div>
        </div>
      </div>);
  },
});

export default CalendarPart;
