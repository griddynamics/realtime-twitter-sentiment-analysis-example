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
import { connect } from 'react-redux';

/**
 * DropdownMenu component for rendering drop down list of movies
 */
class DropdownMenu extends Component {

  constructor(props, context) {
    super(props, context);

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
        this.closeMenu();
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

  closeMenu() {
    this.setState({opened: false});
  }

  toggleMenu() {
    this.setState({opened: !this.state.opened});
  }

  render() {
    const { opened } = this.state;
    const { viewport } = this.props;
    let menu = '';

    const menuLinks = <ul className="menu-list">
        <li className="menu-list-item"><a href="https://www.griddynamics.com/blueprints">Blueprints</a></li>
        <li className="menu-list-item"><a href="https://www.griddynamics.com/company">Company</a></li>
        <li className="menu-list-item"><a href="http://blog.griddynamics.com/">Blog</a></li>
        <li className="menu-list-item"><a href="https://www.griddynamics.com/contact">Contacts</a></li>
      </ul>;

    if (viewport.isMobile) {
      menu = <div className="mobile-menu" ref="dropdown">
        <div className="menu-icon" onClick={ this.toggleMenu.bind(this) }></div>
          <div className={ opened ? 'menu opened' : 'menu' }>
            { menuLinks }
            <ul className="social-links clearfix">
              <li><a target="_blank" href="https://www.facebook.com/griddynamics" className="facebook-ico"></a></li>
              <li><a target="_blank" href="https://twitter.com/griddynamics" className="tweeter-ico"></a></li>
              <li><a target="_blank" href="https://www.linkedin.com/company/grid-dynamics" className="linkedin-ico"></a></li>
              <li><a target="_blank" href="https://www.youtube.com/channel/UCFX-U3YT1ANC907BzvhNn7Q" className="youtube-ico"></a></li>
              <li><a target="_blank" href="https://plus.google.com/b/115302417170674279390/115302417170674279390" className="google-ico"></a></li>
            </ul>
        </div>
      </div>;
    } else {
      menu = <div className="desktop-menu">{ menuLinks }</div>;
    }

    return (menu);
  }
}

function mapStateToProps(state) {
  return {
    viewport: state.viewport
  };
}

export default connect(
  mapStateToProps
)(DropdownMenu);
