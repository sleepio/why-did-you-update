import {classifyDiff, DIFF_TYPES} from './deepDiff'
import {getDisplayName} from './getDisplayName'
import {normalizeOptions} from './normalizeOptions'
import {shouldInclude} from './shouldInclude'

const memoized = (map, key, fn) => {
  // key already in the memoizer
  if (map.has(key)) {
    return map.get(key);
  }
  // key not in memoizer,
  // evaluate the function to get the value
  // to store in our memoizer.
  let ret = fn();
  map.set(key, ret);
  return ret;
}

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

// Creates a wrapper for a React class component
const createClassComponent = (ctor, opts) => {
  let cdu = createComponentDidUpdate(opts);

  // the wrapper class extends the original class,
  // and overwrites its `componentDidUpdate` method,
  // to allow why-did-you-update to listen for updates.
  // If the component had its own `componentDidUpdate`,
  // we call it afterwards.`
  let WDYUClassComponent = class extends ctor {
    componentDidUpdate(prevProps, prevState, snapshot) {
      cdu.call(this, prevProps, prevState);
      if (typeof ctor.prototype.componentDidUpdate === 'function') {
        ctor.prototype.componentDidUpdate.call(this, prevProps, prevState, snapshot);
      }
    }
  }
  // our wrapper component needs an explicit display name
  // based on the original constructor.
  WDYUClassComponent.displayName = getDisplayName(ctor);
  return WDYUClassComponent;
}

// Creates a wrapper for a React functional component
const createFunctionalComponent = (ctor, opts, ReactComponent) => {
  let cdu = createComponentDidUpdate(opts);

  // We call the original function in the render() method,
  // and implement `componentDidUpdate` for `why-did-you-update`
  let WDYUFunctionalComponent = class extends ReactComponent {
    render() {
      return ctor(this.props, this.context);
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
      cdu.call(this, prevProps, prevState, snapshot);
    }
  }

  // copy all statics from the functional component to the class
  // to support proptypes and context apis
  Object.assign(WDYUFunctionalComponent, ctor, {
    // our wrapper component needs an explicit display name
    // based on the original constructor.
    displayName: getDisplayName(ctor)
  })

  return WDYUFunctionalComponent;
}

export const whyDidYouUpdate = (React, opts = {}) => {
  opts = normalizeOptions(opts)

  // Store the original `React.createElement`,
  // which we're going to reference in our own implementation
  // and which we put back when we remove `whyDidYouUpdate` from React.
  let _createReactElement = React.createElement;

  // The memoizer is a JavaScript map that allows us to return
  // the same WrappedComponent for the same original constructor.
  // This ensure that by wrapping the constructor, we don't break
  // React's reconciliation process.
  const memo = new Map();

  // Our new implementation of `React.createElement` works by
  // replacing the element constructor with a class that wraps it.
  React.createElement = function(type, ...rest) {
    let ctor = type;

    // the element is a class component or a functional component
    if (typeof ctor === 'function' && shouldInclude(getDisplayName(ctor), opts)) {
      if (ctor.prototype && typeof ctor.prototype.render === 'function') {
         // If the constructor has a `render` method in its prototype,
        // we're dealing with a class component
        ctor = memoized(memo, ctor, () => createClassComponent(ctor, opts));
      } else {
        // If the constructor function has no `render`,
        // it must be a simple functioanl component.
        ctor = memoized(memo, ctor, () => createFunctionalComponent(ctor, opts, React.Component));
      }
    }

    // Call the old `React.createElement,
    // but with our overwritten constructor
    return _createReactElement.apply(React, [ctor, ...rest]);
  };

  React.__WHY_DID_YOU_UPDATE_RESTORE_FN__ = () => {
    React.createElement = _createReactElement
    delete React.__WHY_DID_YOU_UPDATE_RESTORE_FN__
  }

  return React
}

export default whyDidYouUpdate
