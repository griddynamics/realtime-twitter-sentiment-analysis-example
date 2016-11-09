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

import MovieList from '../components/MovieList';
import DateRange from '../components/DateRange';
import RealtimeChart from '../components/RealtimeChart';
import LiveStatistic from '../components/LiveStatistic';

import HistoryChart from '../components/HistoryChart';
import LineLayersChart from '../components/LineLayersChart';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';
import BubbleChart from '../components/BubbleChart';

import ReactTooltip from '../vendor/react-tooltip';

import CompareList from '../components/CompareList';
import CompareCharts from '../components/CompareCharts';
import ChartType from '../components/CompareChartType';

import TweetsLine from '../components/TweetsLine';
import TweetsFilter from '../components/TweetsFilter';

import ChartLegend from '../components/ChartLegend';

import * as pageActions from '../actions/PageActions';

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

    const {dateRange} = this.props;
    let selectFilter = {
      fromTs: tweetsLine.fromTs,
      toTs: tweetsLine.toTs
    };

    return (
      <div className="main">


        <div className="flexChild columnParent frame">
          <LandingPage />
        </div>


        <div className="frame">
          <div className="container">
            <div className="side">
              <div id="movie-list" className="block">
                <label className="title">Movies</label>
                <MovieList
                  movies={ movies }
                  getMovieList={ getMovieList }
                  selectMovie={ selectMovie }
                  selected={ selected }
                />
              </div>
              <div className="block flex-grow">
                <label className="title ">
                  Tweets
                  <span className="glyphicon glyphicon-question-sign tooltip" data-tip data-for="period-t-tip" />
                  <ReactTooltip id="period-t-tip" place="top" type="dark" effect="solid">
                    Click the "historical data" diagram <br/> on the right to see filtered tweets<br/> for the clicked area. Click the "cross"<br/>to revert to the live stream.
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
            <div className="content">
              <div className="block flex-half">
                <label className="title">
                  Real-time sentiments (updates every 5 secs)
                  <span className="glyphicon glyphicon-question-sign tooltip" data-tip data-for="realtime-t-tip" />
                  <ReactTooltip id="realtime-t-tip" place="top" type="dark" effect="solid">
                    <p>
                      The diagram shows a cumulative number of negative and positive tweets<br/>
                      for the selected movies as well as a "social power" of Twitter users<br/>
                      contributed there. Social power is a number of followers a user has.<br/>
                      Business accounts like News papers, Cinema etc typically have dozens of<br/>
                      thousands followers while normal user (probably you) typically has less<br/>
                      than 500 followers.
                    </p>
                  </ReactTooltip>
                </label>
                <div className="chart-content flex-grow">
                  <div className="chart-box">
                    <RealtimeChart
                      getStreamTweets={ getStreamTweets }
                    />
                  </div>
                  <div className="legend-box">
                    <ChartLegend typeChart="stacked_extended" />
                  </div>
                </div>
              </div>
              <div className="block flex-half">
                <div>
                  <label className="title">Historical sentiments</label>
                  <DateRange
                    dateRange={ dateRange }
                    selectPeriod={ selectPeriod }
                  />
                </div>
                <div className="chart-content flex-grow">
                  <div className="chart-box">
                    <HistoryChart
                      movieData={ movieData }
                      selectPoint={ selectPoint }
                      movieId={ selected }
                    />
                  </div>
                  <div className="legend-box">
                    <ChartLegend typeChart="stacked_extended" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flexChild columnParent frame block">
          <div className="flexChild flexFixed">
            <label className="title">Check what chart is most meaningful for the movie sentiments:</label>
            <DateRange
              dateRange={ dateRange }
              selectPeriod={ selectPeriod }
            />
          </div>
          <div className="flexChild rowParent flexFlow">
            <div className="flexChild columnParent">
              <div className="flexChild rowParent">
                <div className="flexChild flexFlow">
                  <LineLayersChart
                    movieData={ movieData }
                  />
                </div>
                <div className="flexChild flexFixed align-center">
                  <ChartLegend typeChart="stacked_extended" />
                </div>
              </div>
              <div className="flexChild rowParent">
                <div className="flexChild flexFlow">
                  <BarChart
                    movieData={ movieData }
                  />
                </div>
                <div className="flexChild flexFixed align-center">
                  <ChartLegend typeChart="stacked_extended" />
                </div>
              </div>
            </div>
            <div className="flexChild columnParent">
              <div className="flexChild rowParent">
                <div className="flexChild flexFlow">
                  <LineChart
                    movieData={ movieData }
                  />
                </div>
                <div className="flexChild flexFixed align-center">
                  <ChartLegend typeChart="stacked" />
                </div>
              </div>
              <div className="flexChild rowParent">
                <div className="flexChild flexFlow">
                  <BubbleChart
                    movieData={ movieData }
                  />
                </div>
                <div className="flexChild flexFixed align-center">
                  <ChartLegend typeChart="bubble_only" />
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="frame">
          <div className="container">
            <div className="block side">
              <label className="title">Compare options</label>
              <CompareList
                movies={ movies }
                selectedMainMovie={ selected }
                selectMoviesToCompare={ selectMoviesToCompare }
                selected={ selectedMovies }
                dateRange={ dateRange }
              />
              <br/>
              <ChartType
                selectedChartType={ selectedChartType }
                selectChartType={ selectChartType }
              />
            </div>
            <div className="content block">
              <div>
                <label className="title">Check for difference in patterns</label>
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
        </div>
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
