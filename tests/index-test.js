import {deepEqual, equal, ok} from 'assert'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'

import whyDidYouUpdate from 'src/'

const createConsoleStore = type => {
  const entries = []
  const fn = global.console[type]

  global.console[type] = (...args) => {
    entries.push(args)
    // uncomment to debug tests
    // fn.call(global.console, ...args)
  }

  return {
    destroy: () => global.console[type] = fn,
    entries
  }
}

class Stub extends React.Component {
  render () {
    return <noscript />
  }
}

describe(`whyDidYouUpdate`, () => {
  let node
  let groupStore
  let warnStore
  let logStore

  beforeEach(() => {
    whyDidYouUpdate(React)
    node = document.createElement(`div`)
    groupStore = createConsoleStore(`groupCollapsed`)
    warnStore = createConsoleStore(`warn`)
    logStore = createConsoleStore(`log`)
  })

  afterEach(() => {
    React.__WHY_DID_YOU_UPDATE_RESTORE_FN__()
    unmountComponentAtNode(node)
    groupStore.destroy()
    warnStore.destroy()
    logStore.destroy()
  })

  it(`logs a warning on same props`, () => {
    render(<Stub a={1} />, node)
    render(<Stub a={1} />, node)

    equal(groupStore.entries.length, 1)
    equal(groupStore.entries[0][0], `Stub`)

    deepEqual(warnStore.entries, [
      ['Stub.props: Value did not change. Avoidable re-render!'],
      ['Stub.state: Value is the same (equal by reference). Avoidable re-render!']
    ])

    deepEqual(logStore.entries, [
      ['Before:', {a: 1}],
      ['After:', {a: 1}],
      ['Value:', null]
    ])
  })

  it(`does not log a warning on unavoidable re-render with same nested props`, () => {
    render(<Stub a={{b: 1, c: {d: 1}}} />, node)
    render(<Stub a={{b: 2, c: {d: 1}}} />, node)

    equal(groupStore.entries.length, 0)
    equal(warnStore.entries.length, 0)
  })

  it(`logs a warning on function props`, () => {
    const createFn = () => function onChange () {}
    const fn = createFn()
    const fn2 = createFn()

    render(<Stub onChange={fn} />, node)
    render(<Stub onChange={fn2} />, node)

    deepEqual(warnStore.entries, [
      ['Stub.props: Value did not change. Avoidable re-render!'],
      ['Stub.props: Changes are in functions only. Possibly avoidable re-render?'],
      ['Stub.state: Value is the same (equal by reference). Avoidable re-render!']
    ]);

    equal(groupStore.entries.length, 1)
    equal(groupStore.entries[0][0], `Stub`)
    equal(logStore.entries[0][0], 'Before:')
    equal(logStore.entries[1][0], 'After:')
    equal(logStore.entries[2][0], 'Functions before:')
    equal(logStore.entries[3][0], 'Functions after:')

    /*
    I'd like to use deepEqual to check all log entries at once,
    but it seems that on Travis CI logged objects have different fields
    deepEqual(logStore.entries, [
      ['Functions before:', {onChange: fn}],
      ['Functions after:', {onChange: fn2}],
      ['Value:', null]
    ])
    */
  })
})
