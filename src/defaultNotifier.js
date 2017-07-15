import {DIFF_TYPES} from './deepDiff'

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

const notifyDiff = ({name, prev, next, type}) => {
  switch (type) {
  case DIFF_TYPES.SAME:
    console.warn(`${name}: Value is the same (equal by reference). Avoidable re-render!`)
    console.log(`Value:`, prev)
    break;
  case DIFF_TYPES.EQUAL:
    console.warn(`${name}: Value did not change. Avoidable re-render!`)
    console.log(`Before:`, prev)
    console.log(`After:`, next)
    break;
  case DIFF_TYPES.FUNCTIONS:
    console.warn(`${name}: Changes are in functions only. Possibly avoidable re-render?`)
    console.log(`Functions before:`, prev)
    console.log(`Functions after:`, next)
    break;
  }
}
