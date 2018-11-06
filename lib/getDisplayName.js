"use strict";

exports.__esModule = true;
var getDisplayName = exports.getDisplayName = function getDisplayName(o) {
  return o.displayName || o.constructor.displayName || o.constructor.name;
};