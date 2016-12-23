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
 * DropDownList component for rendering drop down list of movies
 */
class DropdownMultiList extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      opened: false
    };
  }

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

    if (selected.length === 2) {
      this.closeList();
    }

    this.props.selectMoviesToCompare(selected);
  }

  handleClick = (event) => {
    if (this.state.opened) {
      let parent = this.refs.dropdown;
      let target = event.target;
      let inserted = parent.contains(target);

      if (!inserted) {
        this.closeList();
      }
    }
  }

  componentWillMount() {
    let root = document.querySelector('#root');
    root.addEventListener('click', this.handleClick, false);
  }

  componentWillUnmount() {
    let root = document.querySelector('#root');
    root.removeEventListener('click', this.handleClick, false);
  }

  openList() {
    this.state.opened !== true && (this.setState({opened: true}))
  }

  closeList() {
    this.state.opened === true && (this.setState({opened: false}))
  }

  toggleList() {
    this.setState({opened: !this.state.opened});
  }

  render() {
    const {
      movies,
      selected
    } = this.props;

    const {
      opened
    } = this.state;

    let selectedMovies = selected.join(' & ');

    return (
      <div className="dropdown multiselect" ref="dropdown">
        <div className="input" onClick={ this.toggleList.bind(this) }>
          <span className="item-check chevron"></span>
          <span className="item-name">{ selectedMovies }</span>
        </div>
        <ul className={ opened ? 'list' : 'list close'}>
          {movies.map((movie) => (
            <li
              className="list-item"
              key={ movie.id }
            >
              <label>
                <span className={ selected.indexOf(movie.id) !== -1 ? 'item-check checked' : 'item-check hidden checked' }></span>
                <input
                  className="hidden"
                  type="checkbox"
                  name="movies"
                  value={ movie.id }
                  onChange={ this.checkMovie.bind(this) }
                  checked={ selected.indexOf(movie.id) !== -1 }
                  disabled={ selected.length == 2 && selected.indexOf(movie.id) == -1 }
                />
                <span className="item-name">
                  { movie.name }
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

DropdownMultiList.propTypes = {
  movies: PropTypes.array.isRequired
};

export default DropdownMultiList;
