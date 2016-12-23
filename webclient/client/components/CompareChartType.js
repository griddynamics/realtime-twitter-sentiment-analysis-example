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

const chartTypes = [
  { name: 'Stacked area', value: 'line_all' },
  { name: 'Stacked area (positive/negative only)', value: 'line' },
  { name: 'Stacked bar', value: 'bar' },
  { name: 'Bubble', value: 'bubble' }
];

/**
 * ChartType component drows radio group for change diagram type to comparison
 */
class ChartType extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      opened: false
    };
  }

  handleClick(event) {
    if (this.state.opened) {
      let parent = this.refs.dropdown;
      let target = event.target;
      let inserted = parent.contains(target);

      if (!inserted) {
        this.closeList();
      }
    }
  }

  componentWillMount() {
    document.addEventListener('click', this.handleClick.bind(this), false);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick.bind(this), false);
  }

  checkMovie(event) {
    this.props.selectMovie(event.currentTarget.dataset.value);
    this.closeList();
  }

  openList() {
    this.setState({opened: true});
  }

  closeList() {
    this.setState({opened: false});
  }

  toggleList() {
    this.setState({opened: !this.state.opened});
  }

/**
 * This method called changes diagram type
 * @param  {Object} evnt
 */
  selectChartType(evnt) {
    this.props.selectChartType(evnt.currentTarget.dataset.value);
    this.closeList();
  }

  render() {
    let selected = chartTypes[0];
    const { opened } = this.state;

    chartTypes.forEach((el) => {
      if (el.value === this.props.selectedChartType) {
        selected = el;
      }
    })

    return (
      <div className="chart_types-selector" ref="dropdown">
        <div className="input" onClick={ this.toggleList.bind(this) }>
          <span className="input-selected">{ selected.name }</span>
          <span className="input-icon"></span>
        </div>
        <ul className={ opened ? 'list' : 'list close'}>
          {chartTypes.map((el) => (
            <li
              className="list-item"
              key={ el.value }
              onClick={ this.selectChartType.bind(this) }
              data-value={ el.value }
            >
              <span className={ selected.value === el.value ? 'item-name checked' : 'item-name' }>
                { el.name }
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default ChartType;
