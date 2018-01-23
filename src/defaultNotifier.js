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

// Disables yellow box in React Native before warn
const consoleWarn = (args) => {
  const oldDisableYellowBox = console.disableYellowBox;
  console.disableYellowBox = true;
  console.warn(args);
  console.disableYellowBox = oldDisableYellowBox;
};

const notifyDiff = ({name, prev, next, type}) => {
  switch (type) {
  case DIFF_TYPES.SAME:
    consoleWarn(`${name}: Value is the same (equal by reference). Avoidable re-render!`)
    console.log(`Value:`, prev)
    break;
  case DIFF_TYPES.EQUAL:
    consoleWarn(`${name}: Value did not change. Avoidable re-render!`)
    console.log(`Before:`, prev)
    console.log(`After:`, next)

    // TODO: This logic should be moved in deepDiff and return a list of
    //       changed props
    if (prev && next) {
      Object.keys(prev).forEach((key) => {
        if (prev[key] !== next[key]) {
          console.log('"' + key + '" property is not equal by reference');
        }
      });
    }
    break;
  case DIFF_TYPES.FUNCTIONS:
    consoleWarn(`${name}: Changes are in functions only. Possibly avoidable re-render?`)
    console.log(`Functions before:`, prev)
    console.log(`Functions after:`, next)
    break;
  }
}
