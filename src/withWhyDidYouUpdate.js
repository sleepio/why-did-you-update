import * as React from 'react';

import { checkForUpdate } from './checkForUpdates';
import { getDisplayName } from './getDisplayName';
import { normalizeOptions } from './normalizeOptions';

export function withWhyDidYouUpdate(WrappedComponent, opts) {
  const normalizedOptions = normalizeOptions(opts);

  class WithWhyDidYouUpdate extends React.Component {
    componentDidUpdate(prevProps, prevState) {
      checkForUpdate(
        normalizedOptions,
        this,
        prevProps,
        this.props,
        prevState,
        this.state
      );
    }
    render() {
      return <WrappedComponent {...this.props} />;
    }
  }
  WithWhyDidYouUpdate.displayName = `WithWhyDidYouUpdate(${getDisplayName(
    WrappedComponent
  )})`;
  return WithWhyDidYouUpdate;
}
