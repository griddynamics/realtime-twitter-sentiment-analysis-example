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
import { connect } from 'react-redux';
import { Bubble } from '../vendor/react-chartjs2/Chart';
import ChartHelper from '../helpers/ChartHelper';
import ChartLegend from './ChartLegend';
import ChartLegendMobile from '../components/ChartLegendMobile';
import ReactTooltip from '../vendor/react-tooltip';

/**
 * BubbleChart component to render Bubble diagram
 */
class BubbleChart extends Component {

  constructor(props, context) {
    super(props, context);

    this.helper = new ChartHelper();

    this.chartOption = this.helper.getBubbleOptions();
    if (props.viewport.isMobile) {
      this.chartOption = this.helper.getBubbleMobileOptions();
    } else {
      this.chartOption = this.helper.getBubbleOptions();
    }
    this.chartDataset = this.helper.datasetBubble();
    this.processData = this.helper.processBubbleLayersData;
  }

  componentDidMount() {
    this.chart = this.refs['chart'].chart_instance;
  }

  shouldComponentUpdate(nextProps) {
    if ((!nextProps.movieData.length && this.props.movieData.length)
      || (nextProps.movieId !== this.props.movieId && this.props.movieData.length)) {
      this.resetChart();
    }

    if (nextProps.movieData.length) {
      if (this.props.movieData.length) {
        let nextlastIndex = nextProps.movieData.length - 1;
        let nextLastEl = nextProps.movieData[nextlastIndex];
        let curlastIndex = this.props.movieData.length - 1;
        let curLastEl = this.props.movieData[curlastIndex];

        if (JSON.stringify(nextLastEl) !== JSON.stringify(curLastEl)) {
          this.updateChart(nextProps.movieData);
        }
      } else {
        this.updateChart(nextProps.movieData);
      }
    }

    return false;
  }

  /**
   * This method is cleaning chart
   */
  resetChart() {
    this.chart.data.datasets = this.helper.datasetBubble().datasets;
    this.chart.config.options.scales.yAxes[0].ticks.stepSize = 1;
    this.chart.update();
  }

  /**
   * This method is update chart from new data
   * @param  {Object} data
   */
  updateChart(data) {
    let cleanData = this.processData(data);
    let step = cleanData.sumOfLastElements < 10 ? 1 : null;

    this.chart.config.options.scales.yAxes[0].ticks.stepSize = step;
    this.chart.data.datasets[0].data = cleanData.negative;
    this.chart.data.datasets[1].data = cleanData.positive;
    this.chart.update();
  }

  render() {

    return (
      <div className="chart-container">
        <label className="title">
          Bubble
          <ChartLegendMobile typeChart="bubble_only" />
        </label>
        <div className="chart-box">
          <div className="chart">
            <Bubble
              ref='chart'
              data={ this.chartDataset }
              options={ this.chartOption }
            />
          </div>
          <div className="legend">
            <ChartLegend typeChart="bubble_only"/>
          </div>
        </div>
      </div>
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
)(BubbleChart);
