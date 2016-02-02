"use strict";

var JSONPath = require('JSONPath');
var getset = require("./getset");

/**
 * Encapsulate state in a "read-only" object.
 */
function createStoreState(props, observer, strict) {
    var state = {};

    var keeper = Object.keys(props).reduce(function(stateKeeper, key) {
        var def = props[key];

        Object.defineProperty(stateKeeper, key, {
            enumerable: true,
            get: function() {
                return state[key];
            },

            set: function(val) {
                if (def.type) {
                    var err = def.type(val);

                    if (err instanceof Error) {
                        console.error("Validation failed for attribute %s with value %s", key, val);
                    }

                    if (strict && err instanceof Error) {
                        console.error("Strict warning: not setting %s", key);
                        return;
                    }

                }

                var prevValue = state[key];
                state[key] = val;
                observer(key, val, prevValue);
            }
        });

        return stateKeeper;
    }, {});
    
    keeper.get = function(key, path){
        getset.get(keeper[key], path);
    };

    keeper.set = function(key, path, value){
        keeper[key] = getset.set(keeper[key], path, value);
    };

    keeper.query = function(key, path) {
        var value = keeper[key];

        if (value != null) {
            if (typeof path == "string")
                return JSONPath({
                    json: value,
                    path: path
                });

            if (Array.isArray(value)){
                return value.filter(function(value, key){
                    return path(key, value);
                });
            }

            if (typeof value === "object") {
                return Object.keys(value).reduce(function(collect, key) {
                    if (path(key, value[key]))
                        collect[key] = value[key];

                    return collect;
                }, {});
            }

            console.warn("Trying to query a non-object, non-array is a no-op");
        }


        return [];
    };

    return Object.freeze(keeper);
}

module.exports = createStoreState;