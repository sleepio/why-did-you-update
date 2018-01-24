import { normalizeOptions } from './normalizeOptions'
import { checkForUpdate } from './checkForUpdates';

import { withWhyDidYouUpdate } from './withWhyDidYouUpdate';

const whyDidYouUpdate = (React, opts = {}) => {

  opts = normalizeOptions(opts)

  const createComponentDidUpdate = () => {
    return function componentDidUpdate (prevProps, prevState) {
      checkForUpdate(opts, this, prevProps, this.props, prevState, this.state);
    }
  }
  const _componentDidUpdate = React.Component.prototype.componentDidUpdate
  React.Component.prototype.componentDidUpdate = createComponentDidUpdate(opts)

  let _createClass = null;
  try {
    _createClass = React.createClass;

    if (_createClass) {
      React.createClass = function createClass (obj) {
        const Mixin = {
          componentDidUpdate: createComponentDidUpdate(opts)
        }

        if (obj.mixins) {
          obj.mixins = [Mixin].concat(obj.mixins)
        } else {
          obj.mixins = [Mixin]
        }

        return _createClass.call(React, obj)
      }
    }
  } catch(e) {}

  React.__WHY_DID_YOU_UPDATE_RESTORE_FN__ = () => {
    React.Component.prototype.componentDidUpdate = _componentDidUpdate
    if (_createClass) {
      React.createClass = _createClass
    }
    delete React.__WHY_DID_YOU_UPDATE_RESTORE_FN__
  }

  return React
}

export { withWhyDidYouUpdate };
export default whyDidYouUpdate;
