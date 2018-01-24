import {classifyDiff, DIFF_TYPES} from './deepDiff'
import {getDisplayName} from './getDisplayName'
import {normalizeOptions} from './normalizeOptions'
import {shouldInclude} from './shouldInclude'

export const checkForUpdate = (opts, component, prevProps, nextProps, prevState, nextState) => {
  const displayName = getDisplayName(component)

  if (!shouldInclude(displayName, opts)) {
    return
  }

  const propsDiff = classifyDiff(prevProps, nextProps, `${displayName}.props`)
  if (propsDiff.type === DIFF_TYPES.UNAVOIDABLE) {
    return
  }

  const stateDiff = classifyDiff(prevState, nextState, `${displayName}.state`)
  if (stateDiff.type === DIFF_TYPES.UNAVOIDABLE) {
    return
  }

  opts.notifier(opts.groupByComponent, opts.collapseComponentGroups, displayName, [propsDiff, stateDiff])
}
