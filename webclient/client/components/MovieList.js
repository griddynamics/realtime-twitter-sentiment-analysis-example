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

/**
 * MovieList component for rendering list of movies
 */
class MovieList extends Component {

  constructor(props, context) {
    super(props, context);

    this.props.getMovieList();
  }


  checkMovie(event) {
    this.props.selectMovie(event.target.value);
  }

  render() {
    const {
      movies,
      selected
    } = this.props;

    return (
      <table className="movie-list" width="100%">
        <thead>
        <tr>
          <th width="*">name</th>
          <th width="50px">IMDb</th>
          <th width="90px">release</th>
        </tr>
        </thead>
        <tbody>
        {movies.map((movie) => (
          <tr key={ movie.id }>
            <td>
              <label className="label">
                <input type="radio" name="movies" value={ movie.id } onChange={ this.checkMovie.bind(this) }
                       checked={ selected == movie.id }/>
                <span className="right">{ movie.name }</span>
              </label>
            </td>
            <td>
              { movie.imdb.toFixed(1) }
            </td>
            <td>
              { movie.releaseDate }
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    );
  }
}

MovieList.propTypes = {
  movies: PropTypes.array.isRequired
};

export default MovieList;
