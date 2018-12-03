import _isString from 'lodash/isString';


import { defaultNotifier } from './defaultNotifier';

export var DEFAULT_INCLUDE = /./;
export var DEFAULT_EXCLUDE = /[^a-zA-Z0-9()]/;

var toRegExp = function toRegExp(s) {
  return _isString(s) ? new RegExp('^' + s + '$') : s;
};
var toArray = function toArray(o) {
  return o ? [].concat(o) : [];
};

var addressStack = [];
var defaultOnRenderStart = function defaultOnRenderStart(displayName) {
  addressStack.push(displayName);
  console.log();
};
var defaultOnRenderEnd = function defaultOnRenderEnd(displayName, diff) {
  if (addressStack[addressStack.length - 1] !== displayName) {
    throw new Error('expecting ' + displayName + ' as top-most on addressStack, instead got ' + addressStack[addressStack.length - 1]);
  }
  console.log(addressStack.join('-') + ' ' + diff + 'ms');
  addressStack.pop(displayName);
};

export var normalizeOptions = function normalizeOptions() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _opts$include = opts.include,
      include = _opts$include === undefined ? [DEFAULT_INCLUDE] : _opts$include,
      _opts$exclude = opts.exclude,
      exclude = _opts$exclude === undefined ? [DEFAULT_EXCLUDE] : _opts$exclude,
      _opts$groupByComponen = opts.groupByComponent,
      groupByComponent = _opts$groupByComponen === undefined ? true : _opts$groupByComponen,
      _opts$collapseCompone = opts.collapseComponentGroups,
      collapseComponentGroups = _opts$collapseCompone === undefined ? true : _opts$collapseCompone,
      _opts$notifier = opts.notifier,
      notifier = _opts$notifier === undefined ? defaultNotifier : _opts$notifier,
      _opts$onRenderStart = opts.onRenderStart,
      onRenderStart = _opts$onRenderStart === undefined ? defaultOnRenderStart : _opts$onRenderStart,
      _opts$onRenderEnd = opts.onRenderEnd,
      onRenderEnd = _opts$onRenderEnd === undefined ? defaultOnRenderEnd : _opts$onRenderEnd;


  return {
    notifier: notifier,
    include: toArray(include).map(toRegExp),
    exclude: toArray(exclude).map(toRegExp),
    groupByComponent: groupByComponent,
    collapseComponentGroups: collapseComponentGroups,
    onRenderStart: onRenderStart,
    onRenderEnd: onRenderEnd
  };
};