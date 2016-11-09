/**
 * The MIT License (MIT)
 * Copyright (c) 2013-2016 Nick Downie
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
'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers;

	Chart.elements = {};

	Chart.Element = function(configuration) {
		helpers.extend(this, configuration);
		this.initialize.apply(this, arguments);
	};

	helpers.extend(Chart.Element.prototype, {

		initialize: function() {
			this.hidden = false;
		},

		pivot: function() {
			var me = this;
			if (!me._view) {
				me._view = helpers.clone(me._model);
			}
			me._start = helpers.clone(me._view);
			return me;
		},

		transition: function(ease) {
			var me = this;

			if (!me._view) {
				me._view = helpers.clone(me._model);
			}

			// No animation -> No Transition
			if (ease === 1) {
				me._view = me._model;
				me._start = null;
				return me;
			}

			if (!me._start) {
				me.pivot();
			}

			helpers.each(me._model, function(value, key) {

				if (key[0] === '_') {
					// Only non-underscored properties
				// Init if doesn't exist
				} else if (!me._view.hasOwnProperty(key)) {
					if (typeof value === 'number' && !isNaN(me._view[key])) {
						me._view[key] = value * ease;
					} else {
						me._view[key] = value;
					}
				// No unnecessary computations
				} else if (value === me._view[key]) {
					// It's the same! Woohoo!
				// Color transitions if possible
				} else if (typeof value === 'string') {
					try {
						var color = helpers.color(me._model[key]).mix(helpers.color(me._start[key]), ease);
						me._view[key] = color.rgbString();
					} catch (err) {
						me._view[key] = value;
					}
				// Number transitions
				} else if (typeof value === 'number') {
					var startVal = me._start[key] !== undefined && isNaN(me._start[key]) === false ? me._start[key] : 0;
					me._view[key] = ((me._model[key] - startVal) * ease) + startVal;
				// Everything else
				} else {
					me._view[key] = value;
				}
			}, me);

			return me;
		},

		tooltipPosition: function() {
			return {
				x: this._model.x,
				y: this._model.y
			};
		},

		hasValue: function() {
			return helpers.isNumber(this._model.x) && helpers.isNumber(this._model.y);
		}
	});

	Chart.Element.extend = helpers.inherits;

};
