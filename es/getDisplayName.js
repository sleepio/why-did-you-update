export var getDisplayName = function getDisplayName(o) {
  return o.displayName || o.constructor.displayName || o.constructor.name;
};