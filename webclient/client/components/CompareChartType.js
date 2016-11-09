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

/**
 * ChartType component drows radio group for change diagram type to comparison
 */
class ChartType extends Component {

  constructor(props, context) {
    super(props, context);
  }

/**
 * This method called changes diagram type
 * @param  {Object} evnt
 */
  selectChartType(evnt) {
    this.props.selectChartType(evnt.target.value);
  }

  render() {
    const selected = this.props.selectedChartType;

    return (
      <div>
        <h2>Select the chart type</h2>
        <div className="half-block">
          <ul className="chart-type-list">
            <li>
              <label className="label">
                <input
                  type="radio"
                  checked={ selected == 'line_all' }
                  name="type-list"
                  value="line_all"
                  onChange={ this.selectChartType.bind(this) }
                />
                <span className="right">Stacked area</span>
              </label>
            </li>
            <li>
              <label className="label">
                <input
                  type="radio"
                  checked={ selected == 'line' }
                  name="type-list"
                  value="line"
                  onChange={ this.selectChartType.bind(this) }
                />
                <span className="right">Stacked area (positive/negative only)</span>
              </label>
            </li>
            <li>
              <label className="label">
                <input
                  type="radio"
                  checked={ selected == 'bar' }
                  name="type-list"
                  value="bar"
                  onChange={ this.selectChartType.bind(this) }
                />
                <span className="right">Stacked bar</span>
              </label>
            </li>
            <li>
              <label className="label">
                <input
                  type="radio"
                  checked={ selected == 'bubble' }
                  name="type-list"
                  value="bubble"
                  onChange={ this.selectChartType.bind(this) }
                />
                <span className="right">Bubble</span>
              </label>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default ChartType;
