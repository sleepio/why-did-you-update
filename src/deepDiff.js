import _ from 'lodash'
import isEqual from 'react-fast-compare'

export const DIFF_TYPES = {
  UNAVOIDABLE: 'unavoidable',
  SAME: 'same',
  EQUAL: 'equal',
  FUNCTIONS: 'functions'
}

export const classifyDiff = (prev, next, name) => {
  if (prev === next) {
    return {
      type: DIFF_TYPES.SAME,
      name,
      prev,
      next
    }
  }

  if (isEqual(prev, next)) {
    return {
      type: DIFF_TYPES.EQUAL,
      name,
      prev,
      next
    }
  }

  if (!prev || !next) {
    return {
      type: DIFF_TYPES.UNAVOIDABLE,
      name,
      prev,
      next
    }
  }

  const isChanged = key => (prev[key] !== next[key]) && (!_.isEqual(prev[key], next[key]));
  const isSameFunction = key => {
    const prevFn = prev[key];
    const nextFn = next[key];
    return _.isFunction(prevFn) && _.isFunction(nextFn) && prevFn.name === nextFn.name;
  };

  const keys = _.union(_.keys(prev), _.keys(next));
  const changedKeys = _.filter(keys, isChanged);

  if (changedKeys.length && _.every(changedKeys, isSameFunction)) {
    return {
      type: DIFF_TYPES.FUNCTIONS,
      name,
      prev: _.pick(prev, changedKeys),
      next: _.pick(next, changedKeys)
    }
  }

  return {
    type: DIFF_TYPES.UNAVOIDABLE,
    name,
    prev,
    next
  }
}
