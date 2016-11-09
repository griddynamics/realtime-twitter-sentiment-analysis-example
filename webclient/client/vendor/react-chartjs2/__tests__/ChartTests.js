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
import ChartComponent from '../Chart';

describe('Chart re-rendering', () => {

    it('required when chart data changes', () => {
        const chart = new ChartComponent({type: 'bar', data: {}});
        const updateRequired = chart.shouldComponentUpdate({type: 'bar', data: {labels: ['a', 'b']}});
        expect(updateRequired).toBeTruthy();
    });

    it('required when chart legend changes', () => {
        const chart = new ChartComponent({type: 'bar', legend: {display: false}});
        const updateRequired = chart.shouldComponentUpdate({type: 'bar', legend: {display: true}});
        expect(updateRequired).toBeTruthy();
    });

    it('required when data is changed in an inner object/array of the data', () => {
        const originalData = {
            'data': {
                'datasets': [
                    {
                        'data': [
                          122968
                        ]
                    },
                    {
                        'data': [
                          14738
                        ]
                    }
                ]
            }
        };
        // The new data has only one data set instead of two
        const newData = {
            'data': {
                'datasets': [
                    {
                        'data': [
                          122968
                        ]
                    }
                ]
            }
        };
        const chart = new ChartComponent(originalData);
        const updateRequired = chart.shouldComponentUpdate(newData);
        expect(updateRequired).toBeTruthy();
    });

    it('required when chart options change', () => {
        const chart = new ChartComponent({type: 'bar', options: {hover: {mode: 'single'}}});
        const updateRequired = chart.shouldComponentUpdate({type: 'bar', options: {hover: {mode: 'label'}}});
        expect(updateRequired).toBeTruthy();
    });

    it('not required when width changes', () => {
        const chart = new ChartComponent({type: 'bar', width: 100});
        const updateRequired = chart.shouldComponentUpdate({type: 'bar', width: 200});
        expect(updateRequired).toBeFalsy();
    });

    it('not required when height changes', () => {
        const chart = new ChartComponent({type: 'bar', height: 100});
        const updateRequired = chart.shouldComponentUpdate({type: 'bar', height: 200});
        expect(updateRequired).toBeFalsy();
    });

    it('not required when data do not change and onElementsClick installed', () => {
        const chart = new ChartComponent({
            type: 'bar', data: {}, onElementsClick: () => {
            }
        });
        const updateRequired = chart.shouldComponentUpdate({
            type: 'bar', data: {}, onElementsClick: () => {
            }
        });
        expect(updateRequired).toBeFalsy();
    });
});
