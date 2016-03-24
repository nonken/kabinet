"use strict";

/**
 * 'set' a property safely. vivicates the object if needed.
 */

var GetSet = {
    set: function(obj, key, value) {
        obj = obj || {};
        obj[key] = value;
        return obj;
    },

    get: function(obj, key) {
        return obj && obj[key];
    }
};

module.exports = GetSet;