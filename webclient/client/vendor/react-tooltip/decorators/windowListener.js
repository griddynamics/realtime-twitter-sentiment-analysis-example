/**
 * The MIT License (MIT)
 * Copyright (c) 2015 Wang Zixiao
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject
 * to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF
 * ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT
 * SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
 * THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Events that should be bound to the window
 */
import CONSTANT from '../constant'

export default function (target) {
  target.prototype.bindWindowEvents = function (resizeHide) {
    // ReactTooltip.hide
    window.removeEventListener(CONSTANT.GLOBAL.HIDE, this.globalHide)
    window.addEventListener(CONSTANT.GLOBAL.HIDE, this.globalHide, false)

    // ReactTooltip.rebuild
    window.removeEventListener(CONSTANT.GLOBAL.REBUILD, this.globalRebuild)
    window.addEventListener(CONSTANT.GLOBAL.REBUILD, this.globalRebuild, false)

    // ReactTooltip.show
    window.removeEventListener(CONSTANT.GLOBAL.SHOW, this.globalShow)
    window.addEventListener(CONSTANT.GLOBAL.SHOW, this.globalShow, false)

    // Resize
    if (resizeHide) {
      window.removeEventListener('resize', this.onWindowResize)
      window.addEventListener('resize', this.onWindowResize, false)
    }
  }

  target.prototype.unbindWindowEvents = function () {
    window.removeEventListener(CONSTANT.GLOBAL.HIDE, this.globalHide)
    window.removeEventListener(CONSTANT.GLOBAL.REBUILD, this.globalRebuild)
    window.removeEventListener(CONSTANT.GLOBAL.SHOW, this.globalShow)
    window.removeEventListener('resize', this.onWindowResize)
  }

  /**
   * invoked by resize event of window
   */
  target.prototype.onWindowResize = function () {
    if (!this.mount) return
    this.hideTooltip()
  }
}
