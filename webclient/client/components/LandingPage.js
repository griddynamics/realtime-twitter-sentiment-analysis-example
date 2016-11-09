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

/**
 * LandingPage component render first info screen
 */
class LandingPage extends Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {

    return (
      <div className="flexChild block landing-page">
        <header>In-Stream Processing reference implementation</header>
        <section className="section-1">
          <div className="paragraf">
            <h1 className="landing-title">What it is</h1>
            <p>
              This is the reference implementation for the In-Stream Processing Service blueprint released by Grid Dynamics. This application is released under the Apache 2 license so you can use its source code to start your project from the scratch, just replacing social analytics business logic with your one.
            </p>
          </div>
          <div className="paragraf">
            <h1 className="landing-title">Social Movie Reviews in action</h1>
            <p className="video-description">
              The Social Movie Reviews application collects realtime tweet streams for selected movies and classifies them as negative and positive. The app shows you realtime trends as well as historical data. You can see the real tweet stream and filter it by clicking the diagram, and see how different visualizations make the data more vibrant. You can even compare two movies and check if there are any visually distinguishable patterns between them.
            </p>
          </div>
        </section>
        <section className="section-2">
          <div className="video-box">
            <div className="youtube-video">
              <iframe width="560" height="315" src="https://www.youtube.com/embed/EulDpXD2nAo" frameBorder="0" allowFullScreen></iframe>
            </div>
          </div>
        </section>
        <div className="links-footer">
          <h1 className="landing-title">Useful links</h1>
          <ul className="links-list">
            <li className="links-list-item"><a href="#">Sandbox starter kit (coming soon)</a></li>
            <li className="links-list-item"><a href="http://blog.griddynamics.com/topic/big-data">In-Stream Processing Service reference architecture</a></li>
            <li className="links-list-item"><a href="https://github.com/griddynamics/realtime-twitter-sentiment-analysis-example">Reference implementation source code</a></li>
            <li className="links-list-item"><a href="#">Reference architecture, cluster management explained (coming soon)</a></li>
            <li className="links-list-item"><a href="#">Deployment and cluster management scripts (coming soon)</a></li>
          </ul>
        </div>
      </div>
    );
  }
}

export default LandingPage;
