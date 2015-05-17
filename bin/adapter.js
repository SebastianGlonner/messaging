/**
 * Polifill environment with missing functionality.
 */
define(function() {
  // Fix safari
  if (Number.isNaN === undefined)
    Number.isNaN = isNaN;

  if (Array.isArray === undefined) {
    Array.isArray = function(vArg) {
      // Taken from MDN.
      return Object.prototype.toString.call(vArg) === '[object Array]';
    };
  }

});
