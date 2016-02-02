"use strict";

var StoreStateBasePrototype = require("./store/proto");

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

    return Object.freeze(keeper);
}

function getStateProps(ctor, props, key) {
    return {
        store: ctor,
        name: key,
        type: props[key].type,
    };
}

function createStateProps(ctor, props) {
    return Object.keys(props).reduce(function(StateProps, key) {

        Object.defineProperty(StateProps, key, {
            enumerable: true,
            get: function() {
                var properties = getStateProps(ctor, props, key);
                properties.query = function(query) {
                    properties._query = query;
                    return properties;
                };
                return properties;
            }
        });

        return StateProps;
    }, {});
}

function createStore(storeName, props) {
    var ctor = function Store(dispatcher) {
        var state, listeners = {};

        // These gettes are the only ones
        // to communicate internal state.
        Object.defineProperties(this, {
            storeName: {
                enumerable: true,
                value: storeName
            },

            __listeners: {
                get: function() {
                    return listeners;
                }
            },

            state: {
                enumerable: true,
                get: function() {
                    if (!state)
                        state = createStoreState(props.stateProps, this.__notify.bind(this), props.strict);

                    return state;
                }
            }
        });
    };

    /**
     * expose storeName, used as cache-key.
     */
    Object.defineProperty(ctor, "storeName", {
        enumerable: true,
        value: storeName
    });

    /**
     * expose the StateProps meta object. StateProps describes the `state` of
     * the store after instantiation.
     */
    ctor.StateProps = createStateProps(ctor, props.stateProps);

    /**
     * Assign StoreStateBasePrototype prototype to proto
     */
    ctor.prototype = Object.create(StoreStateBasePrototype);

    /**
     * Copy any other attributes of props, such as helpers/getters
     */
    Object.keys(props).forEach(function(key) {
        if (ctor.prototype[key]) throw new Error("conflicting key found: " + key);
        if (ctor[key]) return;

        ctor.prototype[key] = props[key];
    });

    // the prototype is now FINAL
    Object.freeze(ctor.prototype);

    return ctor;
}

module.exports.create = createStore;