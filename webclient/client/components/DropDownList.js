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
class DropdownList extends Component {

  constructor(props, context) {
    super(props, context);

    this.props.getItemsList();

    this.state = {
      opened: false
    };
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

  checkMovie(event) {
    this.props.selectMovie(event.currentTarget.dataset.value);
    this.closeList();
  }

  openList() {
    this.setState({opened: true});
  }

  closeList() {
    this.setState({opened: false});
  }

  toggleList() {
    this.setState({opened: !this.state.opened});
  }

  render() {
    const {
      movies,
      selected
    } = this.props;

    const { opened } = this.state;

    let selectedMovie = {name: '', imdb: 0.0, releaseDate: ''};

    movies.map((movie) => {
      if (movie.name === selected) {
        selectedMovie = movie;
      }
    });

    return (
      <div className="dropdown" ref="dropdown">
        <div className="input" onClick={ this.toggleList.bind(this) }>
          <span className="item-check chevron"></span>
          <span className="item-name">{ selectedMovie.name }</span>
          <span className="item-imdb">IMDb { selectedMovie.imdb.toFixed(1) }</span>
          <span className="item-release">{ selectedMovie.releaseDate }</span>
        </div>
        <ul className={ opened ? 'list' : 'list close'}>
          {movies.map((movie) => (
            <li
              className="list-item"
              key={ movie.id }
              onClick={ this.checkMovie.bind(this) }
              data-value={ movie.id }
            >
              <span className={ selected == movie.id ? 'item-check checked' : 'item-check hidden checked' }></span>
              <span className="item-name">{ movie.name }</span>
              <span className="item-imdb">IMDb { movie.imdb.toFixed(1) }</span>
              <span className="item-release">{ movie.releaseDate }</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

DropdownList.propTypes = {
  movies: PropTypes.array.isRequired
};

export default DropdownList;
