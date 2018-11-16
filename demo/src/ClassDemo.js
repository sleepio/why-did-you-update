import React from 'react';
import { hot } from 'react-hot-loader';

const InnerComponent = () => (
  <div>
    Why Did You Update??
  </div>
)

class ClassDemo extends React.Component {
  render() {
    return (
      <div>
        <InnerComponent />
      </div>
    );
  }
}

export default hot(module)(ClassDemo);
