'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashIsEqual = require('lodash/isEqual');

var _lodashIsEqual2 = _interopRequireDefault(_lodashIsEqual);

var _lodashIsFunction = require('lodash/isFunction');

var _lodashIsFunction2 = _interopRequireDefault(_lodashIsFunction);

var _lodashIsObject = require('lodash/isObject');

var _lodashIsObject2 = _interopRequireDefault(_lodashIsObject);

var _lodashKeys = require('lodash/keys');

var _lodashKeys2 = _interopRequireDefault(_lodashKeys);

var _lodashUnion = require('lodash/union');

var _lodashUnion2 = _interopRequireDefault(_lodashUnion);

var isReferenceEntity = function isReferenceEntity(o) {
  return Array.isArray(o) || (0, _lodashIsObject2['default'])(o);
};

var deepDiff = function deepDiff(prev, next, name, notes) {
  var isRefEntity = isReferenceEntity(prev) && isReferenceEntity(next);

  if (!(0, _lodashIsEqual2['default'])(prev, next)) {
    var isFunc = (0, _lodashIsFunction2['default'])(prev) && (0, _lodashIsFunction2['default'])(next);

    if (isFunc) {
      if (prev.name === next.name) {
        var type = 'function';
        return notes.concat({ name: name, prev: prev, next: next, type: type });
      }
    } else if (isRefEntity) {
      var keys = (0, _lodashUnion2['default'])((0, _lodashKeys2['default'])(prev), (0, _lodashKeys2['default'])(next));
      return keys.reduce(function (acc, key) {
        return deepDiff(prev[key], next[key], name + '.' + key, acc);
      }, notes);
    }
  } else if (prev !== next) {
    var type = 'avoidable';

    if (isRefEntity) {
      var keys = (0, _lodashUnion2['default'])((0, _lodashKeys2['default'])(prev), (0, _lodashKeys2['default'])(next));
      return keys.reduce(function (acc, key) {
        return deepDiff(prev[key], next[key], name + '.' + key, acc);
      }, notes.concat({ name: name, prev: prev, next: next, type: type }));
    } else {
      return notes.concat({ name: name, prev: prev, next: next, type: type });
    }
  }

  return notes;
};
exports.deepDiff = deepDiff;