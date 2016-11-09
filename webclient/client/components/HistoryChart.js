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
import { Line } from '../vendor/react-chartjs2/Chart';
import ChartHelper from '../helpers/ChartHelper';
import moment from 'moment';
import { DATE_SHORT, DATE_TIME, DATE_TIME_SHORT } from '../constants/Variable';

/**
 * HistoryChart component to render History diagram
 */
class HistoryChart extends Component {

  constructor(props, context) {
    super(props, context);

    this.helper = new ChartHelper();
    this.lastTooltipItem = null;
    this.deltaTime = 0;
    this.chartOption = this.helper.getLineOptions();
    this.chartDataset = this.helper.datasetLineLayers();
    this.processData = this.helper.processLineLayersData;

    this.chartOption.tooltips.callbacks.label = this.getLabelForPoint.bind(this);
    this.chartOption.onClick = this.getDataPoint.bind(this);
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
   * This method formatted tooltip for history diagram
   * @param  {Object} tooltipItem
   * @return {String}
   */
  getLabelForPoint(tooltipItem) {
    this.lastTooltipItem = tooltipItem;
    return Math.abs(this.lastTooltipItem.yLabel) || '0';
  }

  /**
   * This method getting date from select point in diagram
   */
  getDataPoint() {
    if (this.lastTooltipItem){
      let dataset = this.chart.config.data.datasets[this.lastTooltipItem.datasetIndex];
      let data = dataset.data[this.lastTooltipItem.index];

      this.props.selectPoint({
        movie: this.props.movieId,
        fromTs: data.x,
        toTs: data.x + data.period,
        isPositive: dataset.isPositive,
        grade: dataset.grade,
        perPage: 10,
        page: 1
      });
    }
  }

  /**
   * This method is cleaning chart
   */
  resetChart() {
    this.chart.data.datasets = this.helper.datasetLineLayers().datasets;
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
    this.chart.data.datasets[0].data = cleanData.negativeLow;
    this.chart.data.datasets[1].data = cleanData.negativeMiddle;
    this.chart.data.datasets[2].data = cleanData.negativeHigh;
    this.chart.data.datasets[3].data = cleanData.positiveLow;
    this.chart.data.datasets[4].data = cleanData.positiveMiddle;
    this.chart.data.datasets[5].data = cleanData.positiveHigh;
    this.chart.update();
  }

  render() {

    return (
      <div className="absolute-box">
        <Line
          ref='chart'
          data={ this.chartDataset }
          options={ this.chartOption }
        />
      </div>
    );
  }
}

export default HistoryChart;
