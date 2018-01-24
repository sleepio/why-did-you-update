import React from 'react'
import {render} from 'react-dom'

import whyDidYouUpdate, { withWhyDidYouUpdate } from '../../src'

whyDidYouUpdate(React)

class ClassComponent extends React.Component {
  render () {
    return <div />
  }
}

const FunctionalComponent = () => {
  return <div />
}

// Functional components can be wrapped into a HOC
const WithWhyDidYouUpdate = withWhyDidYouUpdate(FunctionalComponent);

// Class component
render(<ClassComponent a={1} b={{c: {d: 4}}} e={function something () {}} f={1} />, document.querySelector('#demo'))
render(<ClassComponent a={1} b={{c: {d: 4}}} e={function something () {}} f={2} />, document.querySelector('#demo'))

// Functional component
// render(<WithWhyDidYouUpdate a={1} b={{c: {d: 4}}} e={function something () {}} f={1} />, document.querySelector('#demo'))
// render(<WithWhyDidYouUpdate a={1} b={{c: {d: 4}}} e={function something () {}} f={1} />, document.querySelector('#demo'))
