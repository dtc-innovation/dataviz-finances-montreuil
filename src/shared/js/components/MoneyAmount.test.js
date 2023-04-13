import React from 'react';
import { shallow, mount, render } from 'enzyme';

import { default as MoneyAmount, ScaledAmount } from './MoneyAmount.js';

test(`MoneyAmount >= 1.000.000 est en millions`, () => {
    const total = shallow(<MoneyAmount amount={1000000} />);

    expect(total.text()).toEqual('1,0M€');
});

test(`MoneyAmount >= 100.000 est en millions`, () => {
    const total = shallow(<MoneyAmount amount={100000} />);

    expect(total.text()).toEqual('0,1M€');
});

test(`MoneyAmount < 100.000 est en centaines`, () => {
    const total = shallow(<MoneyAmount amount={10000} />);

    expect(total.text()).toEqual('10 000,00€');
});

test(`ScaledAmount 1.000.000 affiche 1.000K`, () => {
    const total = shallow(<ScaledAmount amount={1000000} />);

    expect(total.prop('aria-label')).toEqual('1 000 000,00€');
    expect(total.prop('data-scale')).toEqual('K');
    expect(total.html()).toMatch('<span class="thousands">1</span><span class="hundreds">000</span><span class="suffix">K€</span>');
    expect(total.text()).toMatch('1000K€');
});
