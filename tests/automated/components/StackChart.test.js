import {Map, List} from 'immutable';
import React from 'react';
//import {renderToStaticMarkup} from 'react-dom/server'

import {mount} from 'enzyme';

import D3Axis from '../../../src/shared/js/components/D3Axis'
import StackChart from '../../../src/shared/js/components/StackChart';


test("Simplest StackChart", () => {

    const stackchart = React.createElement(StackChart, {
        xs: [2016],
        ysByX: new Map({
            2016 : new List([['id1', 25]])
        })
    })

    const wrapper = mount(stackchart);

    expect(wrapper.find(D3Axis)).toHaveLength(2);
    expect(wrapper.find('.d3-axis.y .tick').length).toBeGreaterThanOrEqual(2);
    expect(wrapper.find('.content g rect').length).toEqual(1);
    expect(wrapper.find('.content g rect').prop('height')).toBeGreaterThanOrEqual(10);
    expect(wrapper.find('.content g text').length).toBeGreaterThanOrEqual(1);
});

test("StackChart with one value takes all the available height", () => {
    const HEIGHT = 1000, HEIGHT_PADDING = 75, BRICK_SPACING = 7;
    const stackchart = React.createElement(StackChart, {
        HEIGHT, HEIGHT_PADDING, BRICK_SPACING,
        xs: [2016],
        ysByX: new Map({
            2016 : new List([['id1', 25]])
        })
    })

    const wrapper = mount(stackchart);

    expect(wrapper.find('.content g rect').length).toEqual(1);
    expect(wrapper.find('.content g rect').prop('height')+ BRICK_SPACING).toBe(HEIGHT - 2*HEIGHT_PADDING);
});

test("StackChart with 2 equal values takes all the height with BRICK_SPACING", () => {
    const HEIGHT = 1000, HEIGHT_PADDING = 50, BRICK_SPACING = 8;
    const stackchart = React.createElement(StackChart, {
        HEIGHT, HEIGHT_PADDING, BRICK_SPACING,
        xs: [2016],
        ysByX: new Map({
            2016 : new List([['id1', 25], ['id2', 25]])
        })
    })

    const wrapper = mount(stackchart);
    const rects = wrapper.find('.content g rect')

    expect(rects.length).toEqual(2);

    const firstRect = rects.at(0);
    const secondRect = rects.at(1);

    expect(firstRect.prop('height') + secondRect.prop('height') + rects.length*BRICK_SPACING).toBe(HEIGHT - 2*HEIGHT_PADDING);
    expect(firstRect.prop('height')).toEqual(secondRect.prop('height'));
});


test("StackChart with a value of 0 (or below 1px in size) is represented with a minimum height rect", () => {
    const HEIGHT = 540, HEIGHT_PADDING = 20, MIN_BRICK_HEIGHT = 10;
    const stackchart = React.createElement(StackChart, {
        HEIGHT, HEIGHT_PADDING, MIN_BRICK_HEIGHT,
        xs: [2015, 2016, 2017],
        ysByX: new Map({
            2015 : new List([['id1', 250], ['id2', 250]]),
            2016 : new List([['id1', 400], ['id2', 0]]),
            2017 : new List([['id1', 300], ['id2', 0.5]])
        })
    })

    const wrapper = mount(stackchart);
    const rects = wrapper.find('.content g rect')

    expect(rects.length).toEqual(6);
    const [a, b, c, d, e, f] = Array(6).fill().map((x, i) => rects.at(i));

    [a, b, c, e].forEach(el => {
        expect(el.prop('height')).toBeGreaterThan(MIN_BRICK_HEIGHT+1);
    });

    expect(d.prop('height')).toBe(MIN_BRICK_HEIGHT);
    expect(f.prop('height')).toBe(MIN_BRICK_HEIGHT);

});
