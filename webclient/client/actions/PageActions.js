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
import {
  CALLBACK_GET_MOVIES_LIST,
  SELECT_MOVIE,
  SELECT_PERIOD,
  CALLBACK_MOVIE_DATA,
  CALLBACK_NEW_MOVIE_DATA,
  SELECT_MOVIES,
  CALLBACK_COMPARE_MOVIE_DATA,
  SELECT_CHART_TYPE,
  SELECT_POINT,
  RESET_POINT,
  CALLBACK_FULL_MOVIE_DATA_STATISTIC,
  CALLBACK_TWEETS_LINE,
  GET_STREAM_TWEETS,
  CLEAN_DATA,
  CALLBACK_VIEWPORT_CHANGED
} from '../constants/ActionTypes';

import { socket } from './ServerActions';

/* ---------- MovieList ------------- */
/**
 * Action will be called when page loaded
 * @returns {Function}
 */
export function getMovieList() {
  return () => socket.emit('getMovieList');
}

/**
 * Action generated when called callback after server send list of movies in response
 * @param movies
 * @returns {Function}
 */
export function callbackGetMovieList(movies) {
  return (dispatch) => {
    dispatch({
      type: CALLBACK_GET_MOVIES_LIST,
      payload: movies
    });

    dispatch(selectMovie(movies[0].id));
  }
}

/**
 * Action will be called when user select movie in radio button group
 * @param id
 * @returns {Function}
 */
export function selectMovie(id) {
  return (dispatch, getState) => {
    dispatch(cleanAllData());
    dispatch(getStreamTweets(true));
    dispatch(getMovieData(id));

    let state = getState();
    let countMovies = state.movieList.movies.length;
    let index = 0;
    state.movieList.movies.find((el, i) => el.id === id && (index = i));
    let secondIndex = index + 1 < countMovies ? index + 1 : 0;

    dispatch(selectMoviesToCompare([id, state.movieList.movies[secondIndex].id]));

    dispatch({
      type: SELECT_MOVIE,
      payload: id
    });
  };
}
/* --------------- Viewport ------------ */
/**
 * Action generated when called callback after server send list of movies in response
 * @param movies
 * @returns {Function}
 */
export function callbackViewportChanged(viewstate, changed) {
  return {
      type: CALLBACK_VIEWPORT_CHANGED,
      payload: viewstate,
      changed: changed
  }
}
/* ---------- Date Range ------------- */
/**
 * Action will be called when user change date range
 * @param datePeriod
 * @return {Function}
 */
export function selectPeriod(datePeriod) {
  return (dispatch) => {
    dispatch(getMovieData(false, datePeriod));
    dispatch(getMovieCompareData(false, datePeriod));

    dispatch({
      type: SELECT_PERIOD,
      payload: datePeriod
    });
  }
}

/* ---------- Statistic ------------- */
/**
 * Action will be called when need load statistic data for movie
 * @param movieId
 * @param datePeriod
 * @returns {Function}
 */
export function getMovieData(movieId, datePeriod) {
  return (dispatch, getState) => {
    let state = getState();
    let data = {
      movieId: movieId || state.movieList.selected,
      fromTs: datePeriod ? datePeriod[0].format('X') : state.dateRange[0].format('X'),
      toTs: datePeriod ? datePeriod[1].format('X') : state.dateRange[1].format('X')
    };

    socket.emit('getDataForMovie', data);
  }
}

/**
 * Action generated when called callback after server send statistic data for movies in response
 * @param data
 * @returns {{type, payload: *}}
 */
export function callbackMovieData(data) {
  return {
    type: CALLBACK_MOVIE_DATA,
    payload: data
  };
}

/**
 * Action generated when called callback after server send statistic data
 * for selected movie for last time (5 seconds)
 * @param data
 * @returns {{type, payload: *}}
 */
export function callbackNewMovieData(data) {
  return {
    type: CALLBACK_NEW_MOVIE_DATA,
    payload: data
  };
}

/**
 * Action generated when called callback after server send total statistic data
 * for all processed movies for last time (5 seconds)
 * @param data
 * @returns {{type, payload: *}}
 */
export function callbackFullMovieDataStatistic(data) {
  return {
    type: CALLBACK_FULL_MOVIE_DATA_STATISTIC,
    payload: data
  };
}

/* ---------- Compare Movie Data ------------- */
/**
 * Action will be called when need load data for comparing movies
 * @param movieIds
 * @param datePeriod
 * @returns {Function}
 */
export function getMovieCompareData(movieIds, datePeriod) {
  return (dispatch, getState) => {
    let state = getState();
    let data = {
      movies: movieIds || state.compareMovies.selectedMovies,
      fromTs: datePeriod ? datePeriod[0].format('X') : state.dateRange[0].format('X'),
      toTs: datePeriod ? datePeriod[1].format('X') : state.dateRange[1].format('X')
    };
    socket.emit('getDataCompareForMovies', data);
  }
}

/**
 * Action will be called when user change selected movies in checkbox group
 * @param data
 * @returns {Function}
 */
export function selectMoviesToCompare(data) {
  return (dispatch) => {
    dispatch(getMovieCompareData(data));

    dispatch({
      type: SELECT_MOVIES,
      payload: data
    });
  }
}

/**
 * Action will be called when user change selected chart type in radio button group
 * @param data
 * @returns {{type, payload: *}}
 */
export function selectChartType(data) {
  return {
    type: SELECT_CHART_TYPE,
    payload: data
  };
}

/**
 * Action generated when called callback after server send compare data
 * for selected movies
 * @param data
 * @returns {{type, payload: *}}
 */
export function callbackCompareMovieData(data) {
  return {
    type: CALLBACK_COMPARE_MOVIE_DATA,
    payload: data
  };
}

/**
 * Action will be called when user click to historical graphic
 * @param data
 * @returns {Function}
 */
export function selectPoint(data) {
  return (dispatch) => {
    dispatch(getStreamTweets(false));
    socket.emit('getTweetline', data);

    dispatch({
      type: SELECT_POINT,
      payload: data
    });
  };
}

/**
 * Action generated when called callback after server send tweet messages
 * for selected movie and selected time period
 * @param data
 * @returns {{type, payload: *}}
 */
export function callbackSelectPoint(data) {
  return {
    type: CALLBACK_TWEETS_LINE,
    payload: data
  };
}

/**
 * Action will be called when need stream of tweet messages for selected movie
 * @returns {Function}
 */
export function resetPoint() {
  return (dispatch) => {
    dispatch(getStreamTweets(true));

    dispatch({
      type: RESET_POINT
    });
  };
}

/**
 * Action will be called when need on or off stream of tweet messages for selected movie
 * @returns {Function}
 */
export function getStreamTweets(data) {
  socket.emit('liveStream', data);

  return {
    type: GET_STREAM_TWEETS,
    payload: data
  };
}

/**
 * Action will be called when need clear statistic data and historical data
 * @returns {{type}}
 */
export function cleanAllData() {
  return {
    type: CLEAN_DATA
  }
}

