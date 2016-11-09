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
import React, { Component, PropTypes } from 'react';

/**
 * CompareList component renders movie list for comparison
 */
class CompareList extends Component {

  constructor(props, context) {
    super(props, context);
  }

  /**
   * This method adding movie for charts compare
   * @param  {Object} event
   */
  checkMovie(event) {
    let { selected } = this.props;
    let val = event.target.value;
    let index = selected.indexOf(val);

    if (index == -1) {
      if (selected.length < 2) {
        selected.push(val);
      }
    } else {
      selected.splice(index, 1);
    }

    this.props.selectMoviesToCompare(selected);
  }

  render() {
    const {
      movies,
      selected,
      selectedMainMovie
    } = this.props;

    return (
      <div>
        <h2>Select two movies to compare</h2>
        <div className="half-block">
          <table className="movie-list" width="100%">
            <thead>
            </thead>
            <tbody>
            {movies.map((movie) => (
              <tr key={ movie.id }>
                <td>
                  <label className="label">
                    <input
                      type="checkbox"
                      name="movies"
                      value={ movie.id }
                      onChange={ this.checkMovie.bind(this) }
                      checked={ selected.indexOf(movie.id) !== -1 }
                      disabled={ selected.length == 2 && selected.indexOf(movie.id) == -1 }
                    />
                    <span className={ selectedMainMovie === movie.id ? 'strong right' : 'right' }>
                      { movie.name }
                    </span>
                  </label>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

CompareList.propTypes = {
  movies: PropTypes.array.isRequired,
  // getUsersList: PropTypes.func
};

export default CompareList;
