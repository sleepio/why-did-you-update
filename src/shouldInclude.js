import _ from 'lodash'

export const shouldInclude = (displayName, {include, exclude}) => {
  return _.some(include, r => r.test(displayName)) &&
    !_.some(exclude, r => r.test(displayName))
}
