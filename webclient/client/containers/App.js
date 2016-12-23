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
import React, {Component, PropTypes} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import LandingPage from '../components/LandingPage';

import DateRange from '../components/DateRange';
import RealtimeChart from '../components/RealtimeChart';
import LiveStatistic from '../components/LiveStatistic';

import HistoryChart from '../components/HistoryChart';
import LineLayersChart from '../components/LineLayersChart';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import BubbleChart from '../components/BubbleChart';

import ReactTooltip from '../vendor/react-tooltip';

import CompareCharts from '../components/CompareCharts';
import ChartType from '../components/CompareChartType';
import ShareWith from '../components/ShareWith';

import TweetsLine from '../components/TweetsLine';
import TweetsFilter from '../components/TweetsFilter';

import ChartLegend from '../components/ChartLegend';
import ChartLegendMobile from '../components/ChartLegendMobile';

import * as pageActions from '../actions/PageActions';

import DropdownList from '../components/DropdownList';
import DropdownMultiList from '../components/DropdownMultiList';

class App extends Component {

  render() {
    const {
      movies,
      selected
    } = this.props.movieList;

    const movieData = this.props.movieData;

    const tweetsLine = this.props.tweetsLine;

    const {
      selectedMovies,
      movieDataMap,
      selectedChartType
    } = this.props.compareMovies;

    const {
      getMovieList,
      selectMovie,
      selectPeriod,

      getMovieCompareData,
      selectMoviesToCompare,
      selectChartType,

      selectPoint,
      getStreamTweets,
      resetPoint

    } = this.props.pageActions;

    const { dateRange } = this.props;

    let selectFilter = {
      fromTs: tweetsLine.fromTs,
      toTs: tweetsLine.toTs
    };

    return (
      <div className="main">
        <LandingPage />
        <div className="block">
          <div className="title-first"><strong>Real-time/Historical</strong> sentiments</div>
          <div className="content realtime-screen">
            <div className="left-side">
              <div className="box">
                <DropdownList
                  movies={ movies }
                  getItemsList={ getMovieList }
                  selectMovie={ selectMovie }
                  selected={ selected }
                />
                <DateRange
                  dateRange={ dateRange }
                  selectPeriod={ selectPeriod }
                />
              </div>
              <div className="box">
                <RealtimeChart
                  getStreamTweets={ getStreamTweets }
                />
              </div>
              <div className="box">
                <HistoryChart
                  movieData={ movieData }
                  selectPoint={ selectPoint }
                  movieId={ selected }
                />
              </div>
            </div>
            <div className="right-side box">
              <div className="wrapper clearfix">
                <label className="title">Tweets&nbsp;
                  <span className="info-icon" data-tip data-for="tweets-t-tip" />
                  <ReactTooltip id="tweets-t-tip" place="top" type="dark" effect="solid">
                    <p>
                      Click the "historical sentiments" diagram on the left to see filtered tweets for the clicked area. Click the cross-sign to revert to the live stream mode.
                    </p>
                  </ReactTooltip>
                </label>
                <TweetsFilter
                  selectFilter={ selectFilter }
                  stream={ tweetsLine.stream }
                  resetPoint={ resetPoint }
                />
                <TweetsLine
                  tweets={ tweetsLine.tweets }
                  waitingData={ tweetsLine.waitingData }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="block">
          <div className="title-first"><strong>Charts</strong> types</div>
          <div className="content charts-types">
            <div className="box">
              <span className="description">Check what chart is most meaningful for the movie sentiments</span>
              <DateRange
                dateRange={ dateRange }
                selectPeriod={ selectPeriod }
              />
            </div>
            <div className="box-container">
              <div className="box">
                <LineLayersChart movieData={ movieData }/>
              </div>
              <div className="box">
                <LineChart movieData={ movieData }/>
              </div>
              <div className="box">
                <BarChart movieData={ movieData }/>
              </div>
              <div className="box">
                <BubbleChart movieData={ movieData }/>
              </div>
            </div>
          </div>
        </div>
        <div className="block">
          <div className="title-first"><strong>Difference in</strong> patterns</div>
          <div className="content difference-patterns">
            <div className="box">
              <DropdownMultiList
                movies={ movies }
                selectMoviesToCompare={ selectMoviesToCompare }
                selected={ selectedMovies }
                dateRange={ dateRange }
              />
              <ChartType
                selectedChartType={ selectedChartType }
                selectChartType={ selectChartType }
              />
              <DateRange
                dateRange={ dateRange }
                selectPeriod={ selectPeriod }
              />
            </div>
            <CompareCharts
              movieDataMap={ movieDataMap }
              selectedChartType={ selectedChartType }
              selectedMovies={ selectedMovies }
            />
          </div>
        </div>
        <ShareWith/>
        <LiveStatistic />
      </div>
    );
  }
}
/**
 * Set data types for App
 * @type {Object}
 */
App.propTypes = {
  movieList: PropTypes.object.isRequired,
};

/**
 * Binding state
 * @param  {obj}
 * @return {obj}
 */
function mapStateToProps(state) {
  return {
    movieList: state.movieList,
    dateRange: state.dateRange,
    movieData: state.movieData,
    compareMovies: state.compareMovies,
    tweetsLine: state.tweetsLine
  };
}

/**
 * Binding actions
 * @param  {function}
 */
function mapDispatchToProps(dispatch) {
  return {
    pageActions: bindActionCreators(pageActions, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
