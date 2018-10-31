import { classifyDiff, DIFF_TYPES } from './deepDiff';
import { getDisplayName } from './getDisplayName';
import { normalizeOptions } from './normalizeOptions';
import { shouldInclude } from './shouldInclude';

function createComponentDidUpdate(opts) {
  return function componentDidUpdate(prevProps, prevState) {
    var displayName = getDisplayName(this);

    if (!shouldInclude(displayName, opts)) {
      return;
    }

    var propsDiff = classifyDiff(prevProps, this.props, displayName + '.props');
    if (propsDiff.type === DIFF_TYPES.UNAVOIDABLE) {
      return;
    }

    var stateDiff = classifyDiff(prevState, this.state, displayName + '.state');
    if (stateDiff.type === DIFF_TYPES.UNAVOIDABLE) {
      return;
    }
    opts.notifier(opts.groupByComponent, opts.collapseComponentGroups, displayName, [propsDiff, stateDiff]);
  };
}

export var whyDidYouUpdate = function whyDidYouUpdate(React) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var _componentDidUpdate = React.Component.prototype.componentDidUpdate;
  opts = normalizeOptions(opts);

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

export default whyDidYouUpdate;