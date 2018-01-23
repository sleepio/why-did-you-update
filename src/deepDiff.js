import _isEqual from 'lodash.isequal'
import _isFunction from 'lodash.isfunction'
import _keys from 'lodash.keys'
import _union from 'lodash.union'
import _filter from 'lodash.filter'
import _every from 'lodash.every'

// Diff types for classifying
export const DIFF_TYPES = {
  UNAVOIDABLE: 'unavoidable', // Signals that render was unavoidable
  SAME: 'same',               // Signals that objects are the same
  EQUAL: 'equal',             // Signals that objects are deep equal
  FUNCTIONS: 'functions'      // Signals that only functions changed
}

export const classifyDiff = (prev, next, name) => {

  // The prev and next object is the same identity wise. Could be avoided.
  if (prev === next) {
    return {
      type: DIFF_TYPES.SAME,
      name,
      prev,
      next
    }
  }

  // If prev or next object is null it's unavoidable to re-render
  if (!prev || !next) {
    return {
      type: DIFF_TYPES.UNAVOIDABLE,
      name,
      prev,
      next
    }
  }

  const keys = _union(_keys(prev), _keys(next));

  // Check for deep equal comparison
  if (_isEqual(prev, next)) {
    const keysForChangedEntries = _filter(keys, key => (prev[key] !== next[key]));
    return {
      type: DIFF_TYPES.EQUAL,
      name,
      prev,
      next,
      unequalKeys: keysForChangedEntries,
    }
  }

  // Check for function equality
  const hasEntryChangedForKey = key => (prev[key] !== next[key]) && (!_isEqual(prev[key], next[key]));
  const keysForChangedEntries = _filter(keys, hasEntryChangedForKey);
  const isSameFunction = key => {
    const prevFn = prev[key];
    const nextFn = next[key];
    return _isFunction(prevFn) && _isFunction(nextFn) && prevFn.name === nextFn.name;
  };

  if (keysForChangedEntries.length && _every(keysForChangedEntries, isSameFunction)) {
    return {
      type: DIFF_TYPES.FUNCTIONS,
      name,
      prev: prev,
      next: next,
      unequalKeys: keysForChangedEntries,
    }
  }

  // Unavoidable render as something valid changed
  return {
    type: DIFF_TYPES.UNAVOIDABLE,
    name,
    prev,
    next
  }
}
