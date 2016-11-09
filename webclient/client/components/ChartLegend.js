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
import React, { Component } from 'react';

/**
 * ChartLegend component to render legend in all diagram
 */
class ChartLegend extends Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {
    const type = this.props.typeChart;
    let legend = '';

    switch(type) {
      case 'stacked_extended':
        legend = <div className="stacked_extended">
          <h3 className="legend-title">Followers</h3>
          <h4 className="legend-title">Positive</h4>
          <ul className="colors">
            <li><span className="color-block color-positive-low">&lt; 500</span></li>
            <li><span className="color-block color-positive-middle">&lt; 5000</span></li>
            <li><span className="color-block color-positive-hight">&gt; 5000</span></li>
          </ul>
          <h4 className="legend-title">Negative</h4>
          <ul className="colors">
            <li><span className="color-block color-negative-low">&lt; 500</span></li>
            <li><span className="color-block color-negative-middle">&lt; 5000</span></li>
            <li><span className="color-block color-negative-hight">&gt; 5000</span></li>
          </ul>
        </div>;
        break;
      case 'stacked':
        legend = <div className="stacked">
          <h3 className="legend-title">Sentiment</h3>
          <ul className="colors">
            <li><span className="color-block color-positive">Positive</span></li>
            <li><span className="color-block color-negative">Negative</span></li>
          </ul>
        </div>;
        break;
      case 'bubble_only':
        legend = <div className="bubble_only">
          <h4 className="legend-title">Sentiment</h4>
          <ul className="colors">
            <li><span className="color-block color-positive">Positive</span></li>
            <li><span className="color-block color-negative">Negative</span></li>
          </ul>
          <h4 className="legend-title">Followers</h4>
          <ul className="colors">
            <li><span className="size-block size-low">&lt; 500</span></li>
            <li><span className="size-block size-middle">&lt; 5000</span></li>
            <li><span className="size-block size-hight">&gt; 5000</span></li>
          </ul>
        </div>;
        break;
    }

    return (
      <div className="legend-bar">
        { legend }
      </div>
    );
  }
}

export default ChartLegend;
