import {DIFF_TYPES} from './deepDiff'
import _pick from 'lodash.pick'

export const defaultNotifier = (groupByComponent, collapseComponentGroups, displayName, diffs) => {
  if (groupByComponent && collapseComponentGroups) {
    console.groupCollapsed && console.groupCollapsed(displayName)
  } else if (groupByComponent) {
    console.group && console.group(displayName)
  }

  diffs.forEach(notifyDiff)

  if (groupByComponent) {
    console.groupEnd && console.groupEnd()
  }
}

const notifyDiff = ({type, name, prev, next, unequalKeys}) => {
  switch (type) {
  case DIFF_TYPES.SAME:
    console.warn(`${name}: Value is the same (equal by reference). Avoidable re-render!`)
    console.log(`Value:`, prev)
    break;
  case DIFF_TYPES.EQUAL:
    console.warn(`${name}: Value did not change. Avoidable re-render!`)
    console.log(`Before:`, prev)
    console.log(`After:`, next)

    if (unequalKeys.length) {
      console.warn(`${name}: Properties not equal by reference that likely triggered the re-render!`)
      console.log(`Before:`, _pick(prev, unequalKeys));
      console.log(`After:`, _pick(next, unequalKeys));
    }
    break;
  case DIFF_TYPES.FUNCTIONS:
  // TODO: Activate and adjust test
    // console.warn(`${name}: Value did not change. Avoidable re-render!`)
    // console.log(`Before:`, prev)
    // console.log(`After:`, next)
    //
    // if (unequalKeys.length) {
      console.warn(`${name}: Changes are in functions only. Possibly avoidable re-render?`)
      console.log(`Functions before:`, _pick(prev, unequalKeys))
      console.log(`Functions after:`, _pick(next, unequalKeys))
    //}
    break;
  }
}
