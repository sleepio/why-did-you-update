import {classifyDiff, DIFF_TYPES} from './deepDiff'
import {getDisplayName} from './getDisplayName'
import {normalizeOptions} from './normalizeOptions'
import {shouldInclude} from './shouldInclude'

function createComponentDidUpdate (opts) {
  return function componentDidUpdate (prevProps, prevState) {
    const displayName = getDisplayName(this.constructor); 

    if (!shouldInclude(displayName, opts)) {
      return
    }

    const propsDiff = classifyDiff(prevProps, this.props, `${displayName}.props`)
    if (propsDiff.type === DIFF_TYPES.UNAVOIDABLE) {
      return
    }

    const stateDiff = classifyDiff(prevState, this.state, `${displayName}.state`)
    if (stateDiff.type === DIFF_TYPES.UNAVOIDABLE) {
      return
    }
    opts.notifier(opts.groupByComponent, opts.collapseComponentGroups, displayName, [propsDiff, stateDiff])
  }
}

const createClassComponent = (ctor, opts) => {
  let cdu = createComponentDidUpdate(opts);
  let WDYUClassComponent = class extends ctor {
    componentDidUpdate(prevProps, prevState) {
      cdu.call(this, prevProps, prevState);
      if (typeof ctor.prototype.componentDidUpdate === 'function') {
        ctor.prototype.componentDidUpdate.call(this, prevProps, prevState);
      }
    }
  };
  WDYUClassComponent.displayName = getDisplayName(ctor);
  WDYUClassComponent.defaultProps = ctor.defaultProps;
  return WDYUClassComponent;
}

const createFunctionalComponent = (ctor, opts, ReactComponent) => {
  let cdu = createComponentDidUpdate(opts);
  let WDYUFunctionalComponent = class extends ReactComponent {
    render() {
      return ctor(this.props);
    }
    componentDidUpdate(prevProps, prevState) {
      cdu.call(this, prevProps, prevState);
    }
  }
  WDYUFunctionalComponent.displayName = getDisplayName(ctor);
  WDYUFunctionalComponent.defaultProps = ctor.defaultProps;
  return WDYUFunctionalComponent;
}

export const whyDidYouUpdate = (React, opts = {}) => {
  opts = normalizeOptions(opts)
  let oldFn = React.createElement;
  const memoizer = new Map();
  React.createElement = function(type, ...rest) {
    let ctor = type;
    if (ctor.prototype && typeof ctor.prototype.render === 'function') {
      // class component
      ctor = memoizer.get(ctor) || 
        (memoizer.set(ctor, createClassComponent(ctor, opts)) && memoizer.get(ctor));
    } else if (typeof ctor === 'function') {
      // functional component
      ctor = memoizer.get(ctor) ||
        (memoizer.set(ctor, createFunctionalComponent(ctor, opts, React.Component)) && memoizer.get(ctor));
    }
    return oldFn.apply(React, [ctor, ...rest]);
  };

  React.__WHY_DID_YOU_UPDATE_RESTORE_FN__ = () => {
    React.createElement = oldFn
    delete React.__WHY_DID_YOU_UPDATE_RESTORE_FN__
  }

  return React
}

export default whyDidYouUpdate
