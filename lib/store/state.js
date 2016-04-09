"use strict";

var proto = require("./state/proto");
var clone = require("clone");

/**
 * Creates a state proxy, managing the internal values using getters/setters
 * 
 * @param {object} props        - Object of key => propObjects
 * @param {function} observer   - function to call when change occurs
 * @param {bool} strict         - if strict, state will not update on bad types
 */
function createStoreState(props, observer, strict) {
    var state = Object.create(proto, Object.keys(props).reduce(function(state, key) {
        var _value;

        state[key] = {
            enumerable: true,
            get: function() {
                if (!(_value && this.__dirty[key]))
                    return this.__default(props[key].default);

                return clone(_value);
            },

            set: function(val) {
                if (this.__check(props[key].type, strict, key, val)) {
                    this.__dirty[key] = true;
                    var prevValue = _value;
                    _value = val;
                    observer(key, val, prevValue);
                }
            }
        };

        return state;
    }, {}));

    var dirty = Object.keys(props).reduce(function(dirty, key) {
        dirty[key] = false;
        return dirty;
    }, {});

    Object.defineProperty(state, "__dirty", {
        value: dirty,
    });

    return Object.freeze(state);
}

module.exports = createStoreState;