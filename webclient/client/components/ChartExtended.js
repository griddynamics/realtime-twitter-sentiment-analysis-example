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
import Chart from './../vendor/chart/chart';

var helpers = Chart.helpers;


/**
 * This plugin draws a fatty x axis
 */
Chart.plugins.register({
  beforeInit: function (chartInstance) {
  },

  afterInit: function (chartInstance) {
  },

  resize: function (chartInstance, newChartSize) {
  },

  beforeUpdate: function (chartInstance) {
  },

  afterScaleUpdate: function (chartInstance) {
  },

  beforeDatasetsUpdate: function (chartInstance) {
  },

  afterDatasetsUpdate: function (chartInstance) {
  },

  afterUpdate: function (chartInstance) {
  },

// This is called at the start of a render. It is only called once, even if the animation will run for a number of frames. Use beforeDraw or afterDraw
// to do something on each animation frame
  beforeRender: function (chartInstance) {
  },

// Easing is for animation
  beforeDraw: function (chartInstance, easing) {
  },

  afterDraw: function (chartInstance, easing) {
  },
// Before the datasets are drawn but after scales are drawn
  beforeDatasetsDraw: function (chartInstance, easing) {
  },
  afterDatasetsDraw: function (chartInstance, easing) {
    var chartArea = chartInstance.chartArea;
    for(var axis in chartInstance.scales){
      var me = chartInstance.scales[axis];
      var context = me.ctx;
      var options = me.options;
      var gridLines = options.gridLines;
      if(gridLines.zeroLineUpperLayer){
        var tl = gridLines.tickMarkLength;
        var isHorizontal = me.isHorizontal();
        var xTickStart = options.position === 'right' ? me.left : me.right - tl;
        var xTickEnd = options.position === 'right' ? me.left + tl : me.right;
        var yTickStart = options.position === 'bottom' ? me.top : me.bottom - tl;
        var yTickEnd = options.position === 'bottom' ? me.top + tl : me.bottom;
        helpers.each(me.ticks, function(label, index) {
          if (index === (typeof me.zeroLineIndex !== 'undefined' ? me.zeroLineIndex : 0)) {
            // Draw the first index specially
            var lineWidth = gridLines.zeroLineWidth;
            var lineColor = gridLines.zeroLineColor;
            var tx1, ty1, tx2, ty2, x1, y1, x2, y2;
            if (isHorizontal) {

              var xLineValue = me.getPixelForTick(index) + helpers.aliasPixel(lineWidth); // xvalues for grid lines

              tx1 = tx2 = x1 = x2 = xLineValue;
              ty1 = yTickStart;
              ty2 = yTickEnd;
              y1 = chartArea.top;
              y2 = chartArea.bottom;
            } else {

              var yLineValue = me.getPixelForTick(index); // xvalues for grid lines
              yLineValue += helpers.aliasPixel(lineWidth);

              tx1 = xTickStart;
              tx2 = xTickEnd;
              x1 = chartArea.left;
              x2 = chartArea.right;
              ty1 = ty2 = y1 = y2 = yLineValue;
            }

            context.save();
            context.lineWidth = lineWidth;
            context.strokeStyle = lineColor;
            context.beginPath();

            if (gridLines.drawTicks) {
              context.moveTo(tx1, ty1);
              context.lineTo(tx2, ty2);
            }

            if (gridLines.drawOnChartArea) {
              context.moveTo(x1, y1);
              context.lineTo(x2, y2);
            }

            context.stroke();
            context.restore();
          }
        });
      }
    }
  },

  destroy: function (chartInstance) {
  }
});

export default Chart;
