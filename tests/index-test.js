import {deepEqual, equal, ok} from 'assert'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import PropTypes from 'prop-types'

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

let node
let groupStore
let warnStore
let logStore

function createTestElements() {
  node = document.createElement(`div`)
  groupStore = createConsoleStore(`groupCollapsed`)
  warnStore = createConsoleStore(`warn`)
  logStore = createConsoleStore(`log`)
}

describe(`whyDidYouUpdate import`, () => {
  it(`doesn't run upon import`, () => {
    createTestElements()

    render(<Stub a={1} />, node)
    render(<Stub a={1} />, node)

    equal(groupStore.entries.length, 0)
    equal(warnStore.entries.length, 0)
    equal(logStore.entries.length, 0)
  })
})

describe(`whyDidYouUpdate`, () => {
  beforeEach(() => {
    whyDidYouUpdate(React)
    createTestElements()
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
      ['onRenderEnd: Stub'],
      ['onRenderEnd: Stub'],
      ['Before:', { a: 1 }],
      ['After:', { a: 1 }],
      ['Value:', null]
    ]);
  });

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
      ['Stub.props: Changes are in functions only. Possibly avoidable re-render?'],
      ['Stub.state: Value is the same (equal by reference). Avoidable re-render!']
    ])

    equal(groupStore.entries.length, 1);
    equal(groupStore.entries[0][0], `Stub`);
    equal(logStore.entries[0][0], 'onRenderEnd: Stub');
    equal(logStore.entries[1][0], 'onRenderEnd: Stub');
    equal(logStore.entries[2][0], 'Functions before:');
    equal(logStore.entries[3][0], 'Functions after:');

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

  it(`get snapshot on componentDidUpdate`, () => {
    let resolve = false
    class Stub extends React.Component {
      getSnapshotBeforeUpdate() {
        return true
      }
      componentDidUpdate(prevProps, prevState, snapshot) {
        resolve = snapshot
      }
      render () {
        return <noscript />
      }
    }
    render(<Stub />, node)
    render(<Stub a />, node)
    equal(resolve, true)
  })

  it(`handle context`, () => {
    const MyContext = React.createContext()

    let resultContext

    class ClassComponent extends React.Component {
      static contextType = MyContext
      render() {
        resultContext = this.context
        return (
          <div>{resultContext}</div>
        )
      }
    }

    const FatherComponent = () => (
      <div><ClassComponent/></div>
    )

    class Main extends React.Component {
      render() {
        return (
          <MyContext.Provider value='contextValue'>
            <ClassComponent/>
          </MyContext.Provider>
        );
      }
    }

    render(<Main />, node)

    equal(resultContext, 'contextValue')
  })

  it(`handle context old api`, () => {
    const context = {
      contextKey: 'contextValue'
    }

    let resultContext
    const FunctionalComponent = (props, context) => {
      resultContext = context
      return (
        <div>hi</div>
      )
    }

    FunctionalComponent.contextTypes = {
      contextKey: PropTypes.string.isRequired
    }

    const FatherComponent = () => (
      <div><FunctionalComponent/></div>
    )

    class Main extends React.Component {
      static childContextTypes = {
        contextKey: PropTypes.string.isRequired,
      };

      getChildContext() {
        return context;
      }

      render() {
        return (
          <FatherComponent/>
        );
      }
    }

    render(<Main />, node)

    deepEqual(resultContext, context)
  })
})
