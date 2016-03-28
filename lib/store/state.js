"use strict";

var proto = require("./state-proto");

/**
 * Encapsulate state in a "read-only" object.
 */
function createStoreState(props, observer, strict) {
    var state = Object.create(proto, Object.keys(props).reduce(function(state, key) {
        var _value;

        state[key] = {
            enumerable: true,
            get: function() {
                if(!_value) return this.default(props[key].default);
                return this.__clone(_value);
            },

            set: function(val) {
                if(this.check(props[key].type, strict, key, val)){
                    var prevValue = _value;
                    _value = val;
                    observer(key, val, prevValue);
                }
            }
        };
        
        return state;
    }, {}));

    return Object.freeze(state);
}

module.exports = createStoreState;