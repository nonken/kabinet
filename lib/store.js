"use strict";

var StoreStateBasePrototype = require("./store/proto");
var createStateProps = require("./store/state-props");
var createStoreState = require("./store/state");

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