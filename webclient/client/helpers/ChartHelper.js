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
import moment from 'moment';
import { DATE_SHORT, DATE_TIME } from '../constants/Variable';

const fieldListMap = {
  tweetCounterNegativeLow: 'negativeLow',
  tweetCounterNegativeMiddle: 'negativeMiddle',
  tweetCounterNegativeHigh: 'negativeHigh',
  tweetCounterPositiveLow: 'positiveLow',
  tweetCounterPositiveMiddle: 'positiveMiddle',
  tweetCounterPositiveHigh: 'positiveHigh'
};

const radiusMap = {
  negativeLow: 2,
  negativeMiddle: 5,
  negativeHigh: 10,
  positiveLow: 2,
  positiveMiddle: 5,
  positiveHigh: 10
};

const isPositiveMap = {
  negativeLow: false,
  negativeMiddle: false,
  negativeHigh: false,
  positiveLow: true,
  positiveMiddle: true,
  positiveHigh: true
};

const opacityColorsCharts = {
  negativeLow: 'rgba(254, 234, 58, 0.99)',
  negativeMiddle: 'rgba(254, 151, 0, 0.99)',
  negativeHigh: 'rgba(254, 86, 33, 0.99)',

  positiveLow: 'rgba(177, 234, 241, 0.99)',
  positiveMiddle: 'rgba(89, 195, 230, 0.99)',
  positiveHigh: 'rgba(29, 161, 242, 0.99)',

  babblePositive: 'rgba(89, 195, 230, 0.65)',
  babbleNegative: 'rgba(254, 151, 0, 0.65)'
};



const MAX_POINTS_FOR_BUBBLE = 20;

/**
 * Helper class for using with chart js
 */
class ChartHelper {
  constructor() {

  }

  /**
   * Return options for chart js with type line
   * @returns {Object}
   */
  getLineOptions() {
    return {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      title: {
        display: false
      },
      scales: {
        xAxes: [{
          type: 'time',
          position: 'bottom',
          time: {
            displayFormats: {
              millisecond: 'HH:mm:ss',
              second: 'HH:mm:ss',
              minute: 'HH:mm',
              hour: 'M/D/YY HH:mm',
              day: 'M/D/YY',
              week: 'M/D/YY',
              month: 'M/D/YY',
              quarter: '[Q]Q - YYYY',
              year: 'YYYY'
            },
            parser: 'X'
          },
          ticks: {
            maxTicksLimit: 7,
            maxRotation: 35,
            autoSkip: true,
            fontSize: 10,
            padding: 0
          }
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true,
            callback: function (value) {
              return ChartHelper.formatTick(value);
            },
            stepSize: 1
          },
          gridLines: {
            zeroLineWidth: 1,
            zeroLineUpperLayer: true,
            zeroLineColor: "rgba(0, 0, 0, 1)"
          }
        }]
      },
      animation: false,
      hover: {
        mode: 'nearest',
        intersect: true
      },

      tooltips: {
        intersect: false,
        callbacks: {
          label: function (tooltipItems) {
            return Math.abs(tooltipItems.yLabel) || '0';
          },
          title: function (tooltipItems, config) {
            var dataset = config.datasets[tooltipItems[0].datasetIndex];
            return [dataset.label, moment(tooltipItems[0].xLabel, 'X').format(DATE_TIME)];
          }
        }
      }
    };
  }

  /**
   * Return options for chart js with type line
   * @returns {Object}
   */
  getLineMobileOptions() {
    return {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      title: {
        display: false
      },
      layout: {
        padding: 0
      },
      scales: {
        xAxes: [{
          mark: 'mobile',
          display: false,
          type: 'time',
          position: 'bottom',
          time: {
            displayFormats: {
              millisecond: 'HH:mm:ss',
              second: 'HH:mm:ss',
              minute: 'HH:mm',
              hour: 'M/D/YY HH:mm',
              day: 'M/D/YY',
              week: 'M/D/YY',
              month: 'M/D/YY',
              quarter: '[Q]Q - YYYY',
              year: 'YYYY'
            },
            parser: 'X'
          },
          ticks: {
            maxTicksLimit: 7,
            maxRotation: 35,
            autoSkip: true,
            fontSize: 10,
            padding: 0
          }
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true,
            callback: function (value) {
              return ChartHelper.formatTick(value);
            },
            stepSize: 1
          },
          gridLines: {
            zeroLineWidth: 1,
            zeroLineUpperLayer: true,
            zeroLineColor: "rgba(0, 0, 0, 1)"
          }
        }]
      },
      animation: false,
      hover: {
        mode: 'nearest',
        intersect: true
      },

      tooltips: {
        intersect: false,
        callbacks: {
          label: function (tooltipItems) {
            return Math.abs(tooltipItems.yLabel) || '0';
          },
          title: function (tooltipItems, config) {
            var dataset = config.datasets[tooltipItems[0].datasetIndex];
            return [dataset.label, moment(tooltipItems[0].xLabel, 'X').format(DATE_TIME)];
          }
        }
      }
    };
  }

  /**
   * Return options for chart js with type bar
   * @returns {Object}
     */
  getBarOptions() {
    return {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      title: {
        display: false
      },
      scales: {
        xAxes: [{
          stacked: true,
          ticks: {
            maxTicksLimit: 7,
            maxRotation: 35,
            autoSkip: true,
            fontSize: 10,
            padding: 0,
            callback: function (value, index, arr) {
              let count = arr.length - 1;
              let diff = parseInt(arr[count], 10) - parseInt(arr[0], 10);
              let days = diff / (3600 * 24);
              let format = (days <= 1) ? 'M/D/YY HH:mm' : 'M/D/YY';

              return moment(value, 'X').format(format);
            }
          }
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true,
            callback: function (value) {
              return ChartHelper.formatTick(value);
            },
            stepSize: 1
          },
          gridLines: {
            zeroLineWidth: 1,
            zeroLineUpperLayer: true,
            zeroLineColor: "rgba(0, 0, 0, 1)"
          }
        }]
      },
      animation: false,
      tooltips: {
        enabled: true,
        callbacks: {
          label: function (tooltipItems) {
            return Math.abs(tooltipItems.yLabel) || '0';
          },
          title: function (tooltipItems, config) {
            var dataset = config.datasets[tooltipItems[0].datasetIndex];
            return [dataset.label,tooltipItems[0].xLabel];
          }

        }
      }
    };
  }

  /**
   * Return options for chart js with type bar
   * @returns {Object}
   */
  getBarMobileOptions() {
    return {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      title: {
        display: false
      },
      scales: {
        xAxes: [{
          stacked: true,
          display: false,
          ticks: {
            maxTicksLimit: 7,
            maxRotation: 35,
            autoSkip: true,
            fontSize: 10,
            padding: 0,
            callback: function (value, index, arr) {
              let count = arr.length - 1;
              let diff = parseInt(arr[count], 10) - parseInt(arr[0], 10);
              let days = diff / (3600 * 24);
              let format = (days <= 1) ? 'M/D/YY HH:mm' : 'M/D/YY';

              return moment(value, 'X').format(format);
            }
          }
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true,
            callback: function (value) {
              return ChartHelper.formatTick(value);
            },
            stepSize: 1
          },
          gridLines: {
            zeroLineWidth: 1,
            zeroLineUpperLayer: true,
            zeroLineColor: "rgba(0, 0, 0, 1)"
          }
        }]
      },
      animation: false,
      tooltips: {
        enabled: true,
        callbacks: {
          label: function (tooltipItems) {
            return Math.abs(tooltipItems.yLabel) || '0';
          },
          title: function (tooltipItems, config) {
            var dataset = config.datasets[tooltipItems[0].datasetIndex];
            return [dataset.label,tooltipItems[0].xLabel];
          }

        }
      }
    };
  }

  /**
   * Return options for chart js with type bubble
   * @returns {Object}
   */
  getBubbleOptions() {
    return {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      title: {
        display: false
      },
      scales: {
        xAxes: [{
          type: 'time',
          position: 'bottom',
          time: {
            displayFormats: {
              millisecond: 'HH:mm:ss',
              second: 'HH:mm:ss',
              minute: 'HH:mm',
              hour: 'M/D/YY HH:mm',
              day: 'M/D/YY',
              week: 'M/D/YY',
              month: 'M/D/YY',
              quarter: '[Q]Q - YYYY',
              year: 'YYYY'
            },
            parser: 'X'
          },
          ticks: {
            maxTicksLimit: 7,
            maxRotation: 35,
            autoSkip:true,
            fontSize: 10,
            padding: 0
          }
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true,
            callback: function (value) {
              return ChartHelper.formatTick(value);
            },
            stepSize: 1
          }
        }]
      },
      animation: false,
      tooltips: {
        enabled: true,
        callbacks: {
          label: function (tooltipItems) {
            return tooltipItems.yLabel || '0';
          },
          title: function (tooltipItems, config) {
            var dataset = config.datasets[tooltipItems[0].datasetIndex];
            return [dataset.label, moment(tooltipItems[0].xLabel, 'X').format(DATE_SHORT)];
          }
        }
      }
    };
  }

  /**
   * Return options for chart js with type bubble
   * @returns {Object}
   */
  getBubbleMobileOptions() {
    return {
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      title: {
        display: false
      },
      scales: {
        xAxes: [{
          type: 'time',
          position: 'bottom',
          display: false,
          time: {
            displayFormats: {
              millisecond: 'HH:mm:ss',
              second: 'HH:mm:ss',
              minute: 'HH:mm',
              hour: 'M/D/YY HH:mm',
              day: 'M/D/YY',
              week: 'M/D/YY',
              month: 'M/D/YY',
              quarter: '[Q]Q - YYYY',
              year: 'YYYY'
            },
            parser: 'X'
          },
          ticks: {
            maxTicksLimit: 7,
            maxRotation: 35,
            autoSkip:true,
            fontSize: 10,
            padding: 0
          }
        }],
        yAxes: [{
          stacked: true,
          ticks: {
            beginAtZero: true,
            callback: function (value) {
              return ChartHelper.formatTick(value);
            },
            stepSize: 1
          }
        }]
      },
      animation: false,
      tooltips: {
        enabled: true,
        callbacks: {
          label: function (tooltipItems) {
            return tooltipItems.yLabel || '0';
          },
          title: function (tooltipItems, config) {
            var dataset = config.datasets[tooltipItems[0].datasetIndex];
            return [dataset.label, moment(tooltipItems[0].xLabel, 'X').format(DATE_SHORT)];
          }
        }
      }
    };
  }

  /**
   * Return datasets for chart js with type line
   * @returns {Object}
   */
  datasetLine() {
    return {
      datasets: [
        {
          label: 'Negative',
          data: [{x: moment().format('X'), y: 0}],
          lineTension: 0,
          pointRadius: 0,
          backgroundColor: opacityColorsCharts.negativeMiddle
        },
        {
          label: 'Positive',
          data: [{x: moment().format('X'), y: 0}],
          lineTension: 0,
          pointRadius: 0,
          backgroundColor: opacityColorsCharts.positiveMiddle
        }
      ]
    };
  }

  /**
   * Return datasets for chart js with type line
   * chart have six layers
   * @returns {Object}
   */
  datasetLineLayers() {
    return {
      datasets: [
        {
          label: '< 500',//negative
          data: [{x: moment().format('X'), y: 0}],
          lineTension: 0,
          pointRadius: 0,
          backgroundColor: opacityColorsCharts.negativeLow,
          isPositive: false,
          grade: 'low'
        },
        {
          label: '< 5000',//negative
          data: [{x: moment().format('X'), y: 0}],
          lineTension: 0,
          pointRadius: 0,
          backgroundColor: opacityColorsCharts.negativeMiddle,
          isPositive: false,
          grade: 'middle'
        },
        {
          label: '> 5000',//negative
          data: [{x: moment().format('X'), y: 0}],
          lineTension: 0,
          pointRadius: 0,
          backgroundColor: opacityColorsCharts.negativeHigh,
          isPositive: false,
          grade: 'high'
        },
        {
          label: '< 500',
          data: [{x: moment().format('X'), y: 0}],
          lineTension: 0,
          pointRadius: 0,
          backgroundColor: opacityColorsCharts.positiveLow,
          isPositive: true,
          grade: 'low'
        },
        {
          label: '< 5000',
          data: [{x: moment().format('X'), y: 0}],
          lineTension: 0,
          pointRadius: 0,
          backgroundColor: opacityColorsCharts.positiveMiddle,
          isPositive: true,
          grade: 'middle'
        },
        {
          label: '> 5000',
          data: [{x: moment().format('X'), y: 0}],
          lineTension: 0,
          pointRadius: 0,
          backgroundColor: opacityColorsCharts.positiveHigh,
          isPositive: true,
          grade: 'high'
        }
      ]
    };
  }

  /**
   * Return datasets for chart js with type bar
   * chart have six layers
   * @returns {Object}
   */
  datasetBar() {
    return {
      labels: [moment().format('X')],
      datasets: [
        {
          label: '< 500',//negavive
          data: [0],
          backgroundColor: opacityColorsCharts.negativeLow
        },
        {
          label: '< 5000',//negavive
          data: [0],
          backgroundColor: opacityColorsCharts.negativeMiddle
        },
        {
          label: '> 5000',//negavive
          data: [0],
          backgroundColor: opacityColorsCharts.negativeHigh
        },
        {
          label: '< 500',
          data: [0],
          backgroundColor: opacityColorsCharts.positiveLow
        },
        {
          label: '< 5000',
          data: [0],
          backgroundColor: opacityColorsCharts.positiveMiddle
        },
        {
          label: '> 5000',
          data: [0],
          backgroundColor: opacityColorsCharts.positiveHigh
        }
      ]
    };
  }

  /**
   * Return datasets for chart js with type bubble
   * @returns {Object}
   */
  datasetBubble() {
    return {
      datasets: [
        {
          label: 'Negative',
          data: [{x: moment().format('X'), y: 0, r: 0}],
          backgroundColor: opacityColorsCharts.babbleNegative
        },
        {
          label: 'Positive',
          data: [{x: moment().format('X'), y: 0, r: 0}],
          backgroundColor: opacityColorsCharts.babblePositive
        }
      ]
    };
  }

  /**
   * Process TweetStat data for chart js type line
   * @param data Array of TweetStat elements
   * @returns {Object}
     */
  processLineData(data) {
    let cleanData = {
      positive: [],
      negative: []
    };

    let positiveSum = 0;
    let negativeSum = 0;


    data.map((el) => {
      let pItem = {};
      let nItem = {};
      el.timestamp = parseInt(el.timestamp);
      positiveSum += parseInt(el.tweetCounterPositive, 10);
      negativeSum -= parseInt(el.tweetCounterNegative, 10);

      pItem.x = el.timestamp;
      pItem.y = positiveSum;
      pItem.period = el.period;

      nItem.x = el.timestamp;
      nItem.y = negativeSum;
      nItem.period = el.period;

      cleanData.positive.push(pItem);
      cleanData.negative.push(nItem);
    });

    let sumOfLastElements = 0;
    for(var i in cleanData){
      let data = cleanData[i];
      let last = data.length-1;
      sumOfLastElements += (last > -1) ? Math.abs(data[last]) : 0;
    }
    cleanData.sumOfLastElements = sumOfLastElements;

    return cleanData;
  }

  /**
   * Process TweetStat data for chart js type line
   * chart have six layers
   * @param data
   * @returns {Object}
     */
  processLineLayersData(data) {
    let cleanData = {};
    let sumMap = {};
    for (let key in fieldListMap) {
      let value = fieldListMap[key];
      cleanData[value] = [];
      sumMap[value] = 0;
    }


    data.map((el) => {
      el.timestamp = parseInt(el.timestamp);
      for (let key in fieldListMap) {
        let value = fieldListMap[key];
        if (isPositiveMap[value]){
          sumMap[value] += parseInt(el[key]);
        } else {
          sumMap[value] -= parseInt(el[key]);
        }

        let oItem = {};
        oItem.x = el.timestamp + parseInt(el.period);
        oItem.y = sumMap[value];
        oItem.period = el.period;
        cleanData[value].push(oItem);

      }
    });
    let sumOfLastElements = 0;
    for(var i in cleanData){
      let data = cleanData[i];
      let last = data.length-1;
      sumOfLastElements += (last > -1) ? Math.abs(data[last].y) : 0;
    }
    cleanData.sumOfLastElements = sumOfLastElements;

    return cleanData;
  }

  /**
   * Process TweetStat data for chart js type bar
   * chart have six layers
   * @param data
   * @returns {{}}
     */
  processBarLayersData(data) {
    let cleanData = {};
    let sumMap = {};
    for (let key in fieldListMap) {
      let value = fieldListMap[key];
      cleanData[value] = [];
    }
    cleanData.labels = [];
    let sumOfLastElements = 0;

    data.map((el) => {
      let sum = 0;
      for (let key in fieldListMap) {
        let value = fieldListMap[key];
        if(isPositiveMap[value]){
          sumMap[value] = parseInt(el[key]);
        }else{
          sumMap[value] = -parseInt(el[key]);
        }
        sum += Math.abs(sumMap[value]);
        cleanData[value].push(sumMap[value]);
      }
      sumOfLastElements = Math.max(sumOfLastElements,sum);
      cleanData.labels.push(el.timestamp);
    });

    cleanData.sumOfLastElements = sumOfLastElements;

    return cleanData;
  }

  /**
   * Process TweetStat data for chart js type bubble
   * @param data
   * @returns {{positive: Array, negative: Array}}
     */
  processBubbleLayersData(data) {
    let elements = ChartHelper.normalizeDataForBubble(data);
    let cleanData = {
      positive: [],
      negative: []
    };
    let sumMap = {};
    let sumOfLastElements = 0;

    elements.map((el) => {
      for (let key in fieldListMap) {
        let value = fieldListMap[key];
        sumMap[value] = parseInt(el[key]);
        sumOfLastElements = Math.max(sumOfLastElements,sumMap[value]);
        if (sumMap[value] > 0) {
          let oItem = {};
          oItem.x = el.timestamp;
          oItem.y = sumMap[value];
          oItem.period = el.period;
          oItem.r = radiusMap[value];
          if (isPositiveMap[value]) {
            cleanData['positive'].push(oItem);
          } else {
            cleanData['negative'].push(oItem);
          }
        }
      }
    });
    cleanData.sumOfLastElements = sumOfLastElements;

    return cleanData;
  }

  /**
   * Internal helper function need for defuse the points
   * @param data
   * @returns {*}
     */
  static normalizeDataForBubble(data) {
    if (data.length > MAX_POINTS_FOR_BUBBLE) {
      var merge = Math.ceil(data.length / MAX_POINTS_FOR_BUBBLE);
      var ret = [];
      var tmp = null;
      for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        if (i % merge == 0) {
          if (tmp) {
            ret.push(tmp);
          }
          tmp = Object.assign({}, obj);
          tmp.timestamp = parseInt(tmp.timestamp);
        } else {
          //adding objects
          tmp.period = parseInt(obj.timestamp) - tmp.timestamp + parseInt(obj.period);
          for (let key in fieldListMap) {
            tmp[key] = parseInt(tmp[key]) + parseInt(obj[key]);
          }
          let key = 'tweetCounterNegative';
          tmp[key] = parseInt(tmp[key]) + parseInt(obj[key]);
          key = 'tweetCounterPositive';
          tmp[key] = parseInt(tmp[key]) + parseInt(obj[key]);
        }
      }
      if (tmp) {
        ret.push(tmp);
      }
      return ret;
    } else {
      return data;
    }
  }

  static formatTick(value){
    value = value < 0 ? Math.abs(value) : value;
    var strVal = value.toString();
    if(strVal.indexOf('000000') !== -1){
      strVal = strVal.slice(0, -6)+'m';
    }else if(strVal.indexOf('000') !== -1) {
      strVal = strVal.slice(0, -3) + 'k'
    }
    return strVal
  }
}

export default ChartHelper;
