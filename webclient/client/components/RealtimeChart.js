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
import { Line } from '../vendor/react-chartjs2/Chart';
import ChartHelper from '../helpers/ChartHelper';
import ChartLegend from './ChartLegend';
import ChartLegendMobile from '../components/ChartLegendMobile';
import ReactTooltip from '../vendor/react-tooltip';

/**
 * RealtimeChart component for rendering realtime statistics
 * statistic will be updated every 5 seconds
 */
class RealtimeChart extends Component {

  constructor(props, context) {
    super(props, context);

    this.helper = new ChartHelper();

    this.chartOption = this.helper.getLineOptions();
    this.chartMobileOption = this.helper.getLineMobileOptions();
    this.chartDataset = this.helper.datasetLineLayers();
    this.processData = this.helper.processLineLayersData;
  }

  componentDidMount() {
    this.chart = this.refs['chart'].chart_instance;
  }

  shouldComponentUpdate(nextProps) {
    if ((!nextProps.statistic.length && this.props.statistic.length)
      || (nextProps.movieId !== this.props.movieId && this.props.statistic.length)) {
      this.resetChart();
    }

    if (nextProps.statistic.length !== this.props.statistic.length) {
      this.updateChart(nextProps.statistic);
    }

    return false;
  }

  /**
   * Internal helper function, will be executed when we need render empty data
   */
  resetChart() {
    this.chart.data.datasets = this.helper.datasetLineLayers().datasets;
    this.chart.config.options.scales.yAxes[0].ticks.stepSize = 1;
    this.chart.update();
  }

  /**
   * Internal helper function, will be executed when we need render new data
   * @param data
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
    let options = this.props.viewport.isMobile ? this.chartMobileOption : this.chartOption;

    return (
      <div className="chart-container">
        <label className="title">
          Real-time sentiments&nbsp;
          <span className="info-icon" data-tip data-for="realtime-t-tip" />
          <ReactTooltip id="realtime-t-tip" place="top" type="dark" effect="solid">
            <p>
              The diagram shows a cumulative number of negative and positive tweets
              for the selected movies as well as a "social power" of Twitter users
              contributed there. Social power is a number of followers a user has.
              Business accounts like News papers, Cinema etc typically have dozens of
              thousands followers while normal user (probably you) typically has less
              than 500 followers.
            </p>
          </ReactTooltip>
          <ChartLegendMobile typeChart="stacked_extended" />
        </label>
        <div className="chart-box">
          <div className="chart">
            <Line
              ref='chart'
              data={ this.chartDataset }
              options={ options }
            />
          </div>
          <div className="legend">
            <ChartLegend typeChart="stacked_extended"/>
          </div>
        </div>
      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    movieId: state.movieList.selected,
    statistic: state.statistic.statistic,
    viewport: state.viewport
  };
}

export default connect(
  mapStateToProps
)(RealtimeChart);
