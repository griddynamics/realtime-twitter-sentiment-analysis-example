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
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import DropdownMenu from './DropdownMenu';
import ContactsPanel from '../components/ContactsPanel';
import { VIDEO_SCALE_MOBILE, VIDEO_SCALE_DESKTOP } from '../constants/Variable';

/**
 * LandingPage component render first info screen
 */
class LandingPage extends Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {
    let isMobile = this.props.viewport.isMobile;
    let videoScale = isMobile ? VIDEO_SCALE_MOBILE : VIDEO_SCALE_DESKTOP;

    let br = isMobile ? <br/> : '';

    return (
      <div className="block">
        <ContactsPanel/>
        <div className="header-title">
          <DropdownMenu/>
        </div>
        <div className="title-first"><strong>In-Stream Processing </strong>{ br }reference implementation</div>
        <div className="box">
          <section className="section-1">
            <div className="paragraf">
              <h1 className="title-second">What is it</h1>
              <p>
                This is the reference implementation for the In-Stream Processing Service blueprint released by Grid Dynamics. You can get your own instance of the application with Sandbox starter kit to play with any parameter.
              </p>
            </div>
            <div className="paragraf">
              <h1 className="title-second">Social movie reviews in action</h1>
              <p>
                The application receives a stream of tweets filtered by movie name, classifies them into negative and positive tweets, and visualize who makes the main buzz around the movie: regular twitter users, opinion leaders or professionals.
              </p>
            </div>
            <div className="paragraf">
              <h1 className="title-second">Read more</h1>
              <ul className="links-list">
                <li className="links-list-item">
                  <a href="http://tonomi.com/signup">Sandbox starter kit (coming soon)</a>
                </li>
                <li className="links-list-item">
                  <a href="http://blog.griddynamics.com/in-stream-processing-service-blueprint?utm_source=amazon&utm_medium=link&utm_campaign=appdemo">In-Stream Processing Service reference architecture</a>
                </li>
                <li className="links-list-item">
                  <a href="http://blog.griddynamics.com/lets-use-twitter-stream-sentiment-analysis-of-popular-movies-to-teach-the-rudiments-of-data-science?utm_source=amazon&utm_medium=link&utm_campaign=appdemo">Data Science Kitchen blogs</a>
                </li>
                <li className="links-list-item">
                  <a href="https://github.com/griddynamics/realtime-twitter-sentiment-analysis-example">Reference implementation source code</a>
                </li>
                <li className="links-list-item">
                  <a href="http://blog.griddynamics.com/devops-stack-for-in-stream-processing-service-using-aws-docker-mesos-marathon-ansible-and-tonomi">Reference architecture, cluster management explained </a>
                </li>
              </ul>
            </div>
          </section>
          <section className="section-2">
            <iframe width={ videoScale.width } height={ videoScale.height } src="https://www.youtube.com/embed/EulDpXD2nAo" frameBorder="0" allowFullScreen></iframe>
          </section>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    viewport: state.viewport
  };
}

export default connect(
  mapStateToProps
)(LandingPage);
