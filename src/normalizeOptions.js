import _ from 'lodash'

import {defaultNotifier} from './defaultNotifier'

export const DEFAULT_INCLUDE = /./
export const DEFAULT_EXCLUDE = /[^a-zA-Z0-9()]/

const toRegExp = s => _.isString(s) ? new RegExp(`^${s}$`) : s
const toArray = o =>  o ? [].concat(o) : []

const addressStack = [];
const defaultOnRenderStart = displayName => {
  addressStack.push(displayName);
};
const defaultOnRenderEnd = (displayName, diff) => {
  if (addressStack[addressStack.length - 1] !== displayName) {
    throw new Error(`expecting ${displayName} as top-most on addressStack, instead got ${addressStack[addressStack.length - 1]}`);
  }
  console.log(`onRenderEnd: ${addressStack.join('-')}`);
  addressStack.pop(displayName);
};

export const normalizeOptions = (opts = {}) => {
  let {
    include = [DEFAULT_INCLUDE],
    exclude = [DEFAULT_EXCLUDE],
    groupByComponent = true,
    collapseComponentGroups = true,
    notifier = defaultNotifier,
    onRenderStart = defaultOnRenderStart,
    onRenderEnd = defaultOnRenderEnd,
  } = opts;

  return {
    notifier,
    include: toArray(include).map(toRegExp),
    exclude: toArray(exclude).map(toRegExp),
    groupByComponent,
    collapseComponentGroups,
    onRenderStart,
    onRenderEnd,
  };
};
