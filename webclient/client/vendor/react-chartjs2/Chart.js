/**
 * The MIT License (MIT)
 * Copyright (c) 2016 Goran Udosic && Headstart App.
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
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import Chart from './../../components/ChartExtended';
import deepEqual from './utils/deepEqual';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const ChartComponent = React.createClass({

	displayName: 'ChartComponent',

	propTypes: {
		data: PropTypes.object.isRequired,
		height: PropTypes.number,
		legend: PropTypes.object,
		onElementsClick: PropTypes.func,
		options: PropTypes.object,
		redraw: PropTypes.bool,
		type: PropTypes.oneOf(['doughnut', 'pie', 'line', 'bar', 'horizontalBar', 'radar', 'polarArea', 'bubble']),
		width: PropTypes.number
	},

	getDefaultProps() {
		return {
			legend: {
				display: true,
				position: 'bottom'
			},
			type: 'doughnut',
			height: 150,
			width: 300,
			redraw: false,
		};
	},

	componentWillMount() {
		this.chart_instance = undefined;
	},

	componentDidMount() {
		this.renderChart();
	},

	componentDidUpdate() {
		if (this.props.redraw) {
			this.chart_instance.destroy();
			this.renderChart();
		} else {
			this.updateChart();
		}
	},

	_objectWithoutProperties (obj, keys) {
		var target = {};
		for (var i in obj) {
			if (keys.indexOf(i) >= 0) continue;
			if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
			target[i] = obj[i];
		}
		return target;
	},

	shouldComponentUpdate(nextProps, nextState) {
		const ignoredProperties = ['id', 'width', 'height', 'onElementsClick'];
		const compareNext = this._objectWithoutProperties(nextProps, ignoredProperties);
		const compareNow = this._objectWithoutProperties(this.props, ignoredProperties);
		return !deepEqual(compareNext, compareNow, {strict: true});
	},

	componentWillUnmount() {
		this.chart_instance.destroy();
	},

	updateChart() {
		const {data, options} = this.props;

		if (!this.chart_instance) return;

		if (options) {
			this.chart_instance.options = Chart.helpers.configMerge(this.chart_instance.options, options);
		}

		this.chart_instance.config.data = _extends({}, this.chart_instance.config.data, data);

		this.chart_instance.update();
	},

	renderChart() {
		const {data, options, legend, type} = this.props;
		const node = ReactDOM.findDOMNode(this);

		this.chart_instance = new Chart(node, {
			type,
			data,
			options
		});
	},

	handleOnClick(evt) {
		const elems = this.chart_instance.getElementsAtEvent(evt);
		if (elems.length) {
			const {onElementsClick} = this.props;
			onElementsClick(elems);
		}
	},

	render() {
		const {height, width, onElementsClick} = this.props;

		return (
			<canvas
				height={height}
				width={width}
				onClick={typeof onElementsClick === 'function' ? this.handleOnClick : null}
			/>
		);
	}
});

export default ChartComponent;

export class Doughnut extends React.Component {
	render() {
		return (
			<ChartComponent
				{...this.props}
				ref={ref => this.chart_instance = ref && ref.chart_instance}
				type='doughnut'
			/>
		);
	}
}

export class Pie extends React.Component {
	render() {
		return (
			<ChartComponent
				{...this.props}
				ref={ref => this.chart_instance = ref && ref.chart_instance}
				type='pie'
			/>
		);
	}
}

export class Line extends React.Component {
	render() {
		return (
			<ChartComponent
				{...this.props}
				ref={ref => this.chart_instance = ref && ref.chart_instance}
				type='line'
			/>
		);
	}
}

export class Bar extends React.Component {
	render() {
		return (
			<ChartComponent
				{...this.props}
				ref={ref => this.chart_instance = ref && ref.chart_instance}
				type='bar'
			/>
		);
	}
}

export class HorizontalBar extends React.Component {
	render() {
		return (
			<ChartComponent
				{...this.props}
				ref={ref => this.chart_instance = ref && ref.chart_instance}
				type='horizontalBar'
			/>
		);
	}
}

export class Radar extends React.Component {
	render() {
		return (
			<ChartComponent
				{...this.props}
				ref={ref => this.chart_instance = ref && ref.chart_instance}
				type='radar'
			/>
		);
	}
}

export class Polar extends React.Component {
	render() {
		return (
			<ChartComponent
				{...this.props}
				ref={ref => this.chart_instance = ref && ref.chart_instance}
				type='polarArea'
			/>
		);
	}
}

export class Bubble extends React.Component {
	render() {
		return (
			<ChartComponent
				{...this.props}
				ref={ref => this.chart_instance = ref && ref.chart_instance}
				type='bubble'
			/>
		);
	}
}

export const defaults = Chart.defaults;
