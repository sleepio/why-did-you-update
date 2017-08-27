'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _deepDiff = require('./deepDiff');

var _getDisplayName = require('./getDisplayName');

var _normalizeOptions = require('./normalizeOptions');

var _shouldInclude = require('./shouldInclude');

function createComponentDidUpdate(opts) {
  return function componentDidUpdate(prevProps, prevState) {
    var displayName = (0, _getDisplayName.getDisplayName)(this);

    if (!(0, _shouldInclude.shouldInclude)(displayName, opts)) {
      return;
    }

    var propsDiff = (0, _deepDiff.classifyDiff)(prevProps, this.props, displayName + '.props');
    if (propsDiff.type === _deepDiff.DIFF_TYPES.UNAVOIDABLE) {
      return;
    }

    var stateDiff = (0, _deepDiff.classifyDiff)(prevState, this.state, displayName + '.state');
    if (stateDiff.type === _deepDiff.DIFF_TYPES.UNAVOIDABLE) {
      return;
    }
    opts.notifier(opts.groupByComponent, opts.collapseComponentGroups, displayName, [propsDiff, stateDiff]);
  };
}

var whyDidYouUpdate = function whyDidYouUpdate(React) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _componentDidUpdate = React.Component.prototype.componentDidUpdate;
  opts = (0, _normalizeOptions.normalizeOptions)(opts);

  React.Component.prototype.componentDidUpdate = createComponentDidUpdate(opts);

  var _createClass = null;
  try {
    _createClass = React.createClass;

    if (_createClass) {
      React.createClass = function createClass(obj) {
        var Mixin = {
          componentDidUpdate: createComponentDidUpdate(opts)
        };

        if (obj.mixins) {
          obj.mixins = [Mixin].concat(obj.mixins);
        } else {
          obj.mixins = [Mixin];
        }

        return _createClass.call(React, obj);
      };
    }
  } catch (e) {}

  React.__WHY_DID_YOU_UPDATE_RESTORE_FN__ = function () {
    React.Component.prototype.componentDidUpdate = _componentDidUpdate;
    if (_createClass) {
      React.createClass = _createClass;
    }
    delete React.__WHY_DID_YOU_UPDATE_RESTORE_FN__;
  };

  return React;
};

exports.whyDidYouUpdate = whyDidYouUpdate;
exports['default'] = whyDidYouUpdate;