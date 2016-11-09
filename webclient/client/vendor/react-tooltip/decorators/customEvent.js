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
 * Custom events to control showing and hiding of tooltip
 *
 * @attributes
 * - `event` {String}
 * - `eventOff` {String}
 */

const checkStatus = function (dataEventOff, e) {
  const {show} = this.state
  const {id} = this.props
  const dataIsCapture = e.currentTarget.getAttribute('data-iscapture')
  const isCapture = dataIsCapture && dataIsCapture === 'true' || this.props.isCapture
  const currentItem = e.currentTarget.getAttribute('currentItem')

  if (!isCapture) e.stopPropagation()
  if (show && currentItem === 'true') {
    if (!dataEventOff) this.hideTooltip(e)
  } else {
    e.currentTarget.setAttribute('currentItem', 'true')
    setUntargetItems(e.currentTarget, this.getTargetArray(id))
    this.showTooltip(e)
  }
}

const setUntargetItems = function (currentTarget, targetArray) {
  for (let i = 0; i < targetArray.length; i++) {
    if (currentTarget !== targetArray[i]) {
      targetArray[i].setAttribute('currentItem', 'false')
    } else {
      targetArray[i].setAttribute('currentItem', 'true')
    }
  }
}

let customListener

export default function (target) {
  target.prototype.isCustomEvent = function (ele) {
    const {event} = this.state
    return event || !!ele.getAttribute('data-event')
  }

  /* Bind listener for custom event */
  target.prototype.customBindListener = function (ele) {
    const {event, eventOff} = this.state
    const dataEvent = ele.getAttribute('data-event') || event
    const dataEventOff = ele.getAttribute('data-event-off') || eventOff

    dataEvent.split(' ').forEach(event => {
      ele.removeEventListener(event, customListener)
      customListener = checkStatus.bind(this, dataEventOff)
      ele.addEventListener(event, customListener, false)
    })
    if (dataEventOff) {
      dataEventOff.split(' ').forEach(event => {
        ele.removeEventListener(event, this.hideTooltip)
        ele.addEventListener(event, this.hideTooltip, false)
      })
    }
  }

  /* Unbind listener for custom event */
  target.prototype.customUnbindListener = function (ele) {
    const {event, eventOff} = this.state
    const dataEvent = event || ele.getAttribute('data-event')
    const dataEventOff = eventOff || ele.getAttribute('data-event-off')

    ele.removeEventListener(dataEvent, customListener)
    if (dataEventOff) ele.removeEventListener(dataEventOff, this.hideTooltip)
  }
}
