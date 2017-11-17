'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashIsequal = require('lodash.isequal');

var _lodashIsequal2 = _interopRequireDefault(_lodashIsequal);

var _lodashIsfunction = require('lodash.isfunction');

var _lodashIsfunction2 = _interopRequireDefault(_lodashIsfunction);

var _lodashKeys = require('lodash.keys');

var _lodashKeys2 = _interopRequireDefault(_lodashKeys);

var _lodashUnion = require('lodash.union');

var _lodashUnion2 = _interopRequireDefault(_lodashUnion);

var _lodashFilter = require('lodash.filter');

var _lodashFilter2 = _interopRequireDefault(_lodashFilter);

var _lodashEvery = require('lodash.every');

var _lodashEvery2 = _interopRequireDefault(_lodashEvery);

var _lodashPick = require('lodash.pick');

var _lodashPick2 = _interopRequireDefault(_lodashPick);

var DIFF_TYPES = {
  UNAVOIDABLE: 'unavoidable',
  SAME: 'same',
  EQUAL: 'equal',
  FUNCTIONS: 'functions'
};

exports.DIFF_TYPES = DIFF_TYPES;
var classifyDiff = function classifyDiff(prev, next, name) {
  if (prev === next) {
    return {
      type: DIFF_TYPES.SAME,
      name: name,
      prev: prev,
      next: next
    };
  }

  if ((0, _lodashIsequal2['default'])(prev, next)) {
    return {
      type: DIFF_TYPES.EQUAL,
      name: name,
      prev: prev,
      next: next
    };
  }

  if (!prev || !next) {
    return {
      type: DIFF_TYPES.UNAVOIDABLE,
      name: name,
      prev: prev,
      next: next
    };
  }

  var isChanged = function isChanged(key) {
    return prev[key] !== next[key] && !(0, _lodashIsequal2['default'])(prev[key], next[key]);
  };
  var isSameFunction = function isSameFunction(key) {
    var prevFn = prev[key];
    var nextFn = next[key];
    return (0, _lodashIsfunction2['default'])(prevFn) && (0, _lodashIsfunction2['default'])(nextFn) && prevFn.name === nextFn.name;
  };

  var keys = (0, _lodashUnion2['default'])((0, _lodashKeys2['default'])(prev), (0, _lodashKeys2['default'])(next));
  var changedKeys = (0, _lodashFilter2['default'])(keys, isChanged);

  if (changedKeys.length && (0, _lodashEvery2['default'])(changedKeys, isSameFunction)) {
    return {
      type: DIFF_TYPES.FUNCTIONS,
      name: name,
      prev: (0, _lodashPick2['default'])(prev, changedKeys),
      next: (0, _lodashPick2['default'])(next, changedKeys)
    };
  }

  return {
    type: DIFF_TYPES.UNAVOIDABLE,
    name: name,
    prev: prev,
    next: next
  };
};
exports.classifyDiff = classifyDiff;