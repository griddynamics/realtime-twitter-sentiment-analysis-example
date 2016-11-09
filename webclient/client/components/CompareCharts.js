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
import { Line, Bar, Bubble } from '../vendor/react-chartjs2/Chart';
import ChartHelper from '../helpers/ChartHelper';
import ChartLegend from '../components/ChartLegend';

/**
 * CompareCharts component draws two diagrams for comparison
 */
class CompareCharts extends Component {

  constructor(props, context) {
    super(props, context);

    this.chartHelper = [];
    this.chartHelper.push(new ChartHelper());
    this.chartHelper.push(new ChartHelper());
    this.processData = this.chartHelper[0].processLineLayersData;
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.selectedChartType !== this.props.selectedChartType) {
      switch (nextProps.selectedChartType) {
        case 'line':
          this.processData = this.chartHelper[0].processLineData;
          break;
        case 'line_all':
          this.processData = this.chartHelper[0].processLineLayersData;
          break;
        case 'bar':
          this.processData = this.chartHelper[0].processBarLayersData;
          break;
        case 'bubble':
          this.processData = this.chartHelper[0].processBubbleLayersData;
          break;
      }
      return true;
    }

    if (Object.keys(nextProps.movieDataMap).length) {
      let changed = false;
      let oldLen = this.props.movieDataMap.movieDataMap ? Object.keys(this.props.movieDataMap.movieDataMap).length : 0;
      let newLen = nextProps.movieDataMap ? Object.keys(nextProps.movieDataMap).length : 0;
      if(oldLen != newLen){
        changed = true;
      }
      for(let movieId in this.props.movieDataMap){
        if(!nextProps.movieDataMap[movieId]){
          changed = true;
          break;
        }else{
          let oldData = this.props.movieDataMap[movieId];
          let newData = nextProps.movieDataMap[movieId];
          let nextlastIndex = newData.length - 1;
          let nextLastEl = newData[nextlastIndex];
          let curlastIndex = oldData.length - 1;
          let curLastEl = oldData[curlastIndex];

          if (JSON.stringify(nextLastEl) !== JSON.stringify(curLastEl)) {
            changed = true;
            break;
          }
        }
      }
      if(JSON.stringify(this.props.selectedMovies) !== JSON.stringify(nextProps.selectedMovies)){
        changed = true;
      }
      return changed;
    }
    return false;
  }

  componentDidUpdate() {
    this.updateCharts(this.props.movieDataMap);
  }

  /**
   * This method is update chart from new data
   * @param  {Object} data
   */
  updateCharts(data) {
    for (let i in this.props.selectedMovies) {
      let key = this.props.selectedMovies[i];
      if(data[key]) {
        let cleanData = this.processData(data[key]);
        let chart = this.refs['chart' + i].chart_instance;
        let step = cleanData.sumOfLastElements < 10 ? 1 : null;

        chart.config.options.scales.yAxes[0].ticks.stepSize = step;

        switch (this.props.selectedChartType) {
          case 'line':
          case 'bubble':
            chart.data.datasets[0].data = cleanData.negative;
            chart.data.datasets[1].data = cleanData.positive;
            break;
          case 'bar':
          case 'line_all':
            chart.data.datasets[0].data = cleanData.negativeLow;
            chart.data.datasets[1].data = cleanData.negativeMiddle;
            chart.data.datasets[2].data = cleanData.negativeHigh;
            chart.data.datasets[3].data = cleanData.positiveLow;
            chart.data.datasets[4].data = cleanData.positiveMiddle;
            chart.data.datasets[5].data = cleanData.positiveHigh;
            break;
        }

        if (cleanData.hasOwnProperty('labels')) {
          chart.data.labels = cleanData.labels;
        }

        chart.update();
      }
    }

    let selMovie = this.props.selectedMovies.length;

    for (let i = 0, a = 2; i < a; i++) {
      if (selMovie + i === a) {
        break;
      }
      let chart = this.refs[`chart${selMovie + i}`].chart_instance;
      chart.config.options.scales.yAxes[0].ticks.stepSize = 1;
      chart.update();
    }
  }

  render() {
    let charts = [];
    let legendType = 'stacked_extended';
    let dataKeys = Object.keys(this.props.movieDataMap);

    for (let i = 0; i < this.chartHelper.length; i++) {
      let template = '';
      let ref = `chart${i}`;
      let options = {};
      let title = this.props.selectedMovies[i] || '';

      switch(this.props.selectedChartType) {
        case 'line':
          options = this.chartHelper[i].getLineOptions();
          options.title.text = title;

          template = <Line
            ref={ ref }
            data={ this.chartHelper[i].datasetLine() }
            options={ options }
          />;

          legendType = 'stacked';
          break;
        case 'line_all':
          options = this.chartHelper[i].getLineOptions();
          options.title.text = title;

          template = <Line
            ref={ ref }
            data={ this.chartHelper[i].datasetLineLayers() }
            options={ options }
          />;

          legendType = 'stacked_extended';
          break;
        case 'bar':
          options = this.chartHelper[i].getBarOptions();
          options.title.text = title;

          template = <Bar
            ref={ ref }
            data={ this.chartHelper[i].datasetBar() }
            options={ options }
          />;

          legendType = 'stacked_extended';
          break;
        case 'bubble':
          options = this.chartHelper[i].getBubbleOptions();
          options.title.text = title;
          template = <Bubble
            ref={ ref }
            data={ this.chartHelper[i].datasetBubble() }
            options={ options }
          />;

          legendType = 'bubble_only';
          break;
      }

      charts.push(template);
    }

    return (
      <div className="flex-grow chart-content-col">
        <div className="flex-half">
          <div className="chart-content flex-grow">
            <div className="chart-box">
              <div className="absolute-box">
                { charts[0] }
              </div>
            </div>
            <div className="legend-box">
              <ChartLegend typeChart={ legendType } />
            </div>
          </div>
        </div>

        <div className="flex-half">
          <div className="chart-content flex-grow">
            <div className="chart-box">
              <div className="absolute-box">
                { charts[1] }
              </div>
            </div>
            <div className="legend-box">
              <ChartLegend typeChart={ legendType } />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default CompareCharts;
