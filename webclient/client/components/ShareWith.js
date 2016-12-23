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
 * ShareWith component to render share panel
 */
class ShareWith extends Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {

    return (
      <div className="share-with">
        <div className="share-with-block clearfix">
          <span className="share-title">SHARE WITH</span>
          <a className="fb share-button" title="Facebook" href="http://www.facebook.com/sharer.php?u=http://apps.griddynamics.com/realtime-twitter-sentiment-analysis-example-mobile?hs_preview=oJDxXFJk-4585178252" target="_blank">
          </a>
          <a className="tweet share-button" title="Twitter" href="https://twitter.com/share?url=http://apps.griddynamics.com/realtime-twitter-sentiment-analysis-example-mobile&amp;text=Simple%20Share%20Buttons" target="_blank">
          </a>
          <a className="linkedin share-button" title="LinkedIn" href="http://www.linkedin.com/shareArticle?mini=true&amp;url=http://apps.griddynamics.com/realtime-twitter-sentiment-analysis-example-mobile?hs_preview=oJDxXFJk-4585178252" target="_blank">
          </a>
          <a className="google share-button" title="Google+" href="https://plus.google.com/share?url=http://apps.griddynamics.com/realtime-twitter-sentiment-analysis-example-mobile?hs_preview=oJDxXFJk-4585178252" target="_blank">
          </a>
          <a className="email share-button" title="Email" href="mailto:?Subject=Simple Share Buttons&amp;Body=I%20saw%20this%20and%20thought%20of%20you!%20 http://apps.griddynamics.com/realtime-twitter-sentiment-analysis-example-mobile?hs_preview=oJDxXFJk-4585178252" target="_blank">
          </a>
        </div>
      </div>
    );
  }
}

export default ShareWith;
