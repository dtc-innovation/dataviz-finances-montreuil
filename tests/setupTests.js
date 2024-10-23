import util from 'node:util'
import { beforeAll, expect } from '@jest/globals'
import { configure } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import * as matchers from 'jest-immutable-matchers';

configure({ adapter: new Adapter() });

beforeAll(() => {
  expect.extend(matchers)
})

Object.defineProperty(globalThis, 'TextEncoder', {
  value: util.TextEncoder
})
