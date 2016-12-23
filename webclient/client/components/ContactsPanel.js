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
 * contactsPanel component to render contacts panel for desktop
 */
class contactsPanel extends Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {

    return (
      <div className="contacts-panel clearfix">
        <div className="phone-block">
          <strong>650-523-5000</strong>
        </div>
        <div className="email-block">
          info@griddynamics.com
        </div>
        <div className="social-block">
          <ul className="social-links clearfix">
            <li><a href="https://www.facebook.com/griddynamics" className="facebook-ico"></a></li>
            <li><a href="https://twitter.com/griddynamics" className="tweeter-ico"></a></li>
            <li><a href="https://www.linkedin.com/company/grid-dynamics" className="linkedin-ico"></a></li>
            <li><a href="https://www.youtube.com/channel/UCFX-U3YT1ANC907BzvhNn7Q" className="youtube-ico"></a></li>
            <li><a href="https://plus.google.com/b/115302417170674279390/115302417170674279390" className="google-ico"></a></li>
          </ul>
        </div>
      </div>
    );
  }
}

export default contactsPanel;
