"use strict";

var clone = require("clone");

function typeCheck(type, key, value) {
    // first check if this is a React type
    if (type && type.name == "bound checkType") {
        var obj = {};
        obj[key] = value;
        return type(obj, key);
    }

    return type(value);
}

module.exports = {
    __default: function(def) {
        if (!def) return;

        if (typeof def == "function")
            return def();

        return clone(def);
    },

    __check: function(type, strict, key, val) {
        if (!type) return true;

        var err = typeCheck(type, key, val);

        if ((err instanceof Error)) {
            console.error("Validation failed for attribute %s with value %s", key, val);

            if (strict) {
                console.error("Strict warning: not setting %s", key);
                return false;
            }
        }

        return true;
    },

    has: function(key, path) {
        if (!this.__dirty[key])
            return false;

        return !!this.get(key, path);
    },

    get: function(key, path) {
        if (this[key])
            return this[key][path];
    },

    set: function(key, path, value) {
        var _state = this.__dirty[key] ? this[key] : {};

        _state[path] = value;

        this[key] = _state;
    },

    push: function(key, value) {
        var _state = this.__dirty[key] ? this[key] : [];

        // force array, typechecks will warn
        if (!Array.isArray(_state))
            _state = [];

        this[key] = _state.concat(value);
    }
};
