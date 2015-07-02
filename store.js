"use strict";

/**
 * Shared prototype of all Stores, e.g. baseclass.
 */
var StoreStateBasePrototype = {
    getState: function getState() {
        return this.state;
    },

    observe: function(attr, handler) {
        if (!this.__listeners[attr]) {
            this.__listeners[attr] = [];
        }

        this.__listeners[attr].push(handler);
    },

    stopObserving: function(attr, handler) {
        if (!this.__listeners[attr])
            throw "Fail to unbind " + attr + " for store " + this.storeName;
            
        if (!this.__listeners[attr].indexOf(handler) === -1)
            return console.warn("Attempt to unbind unitialize attr " + attr + " for store " + this.storeName);

        this.__listeners[attr].splice(this.__listeners[attr].indexOf(handler));
    },

    hydrate: function hydrate(newState) {
        for (var key in this.state) {
            this.state[key] = newState[key];
        }
    },

    dehydrate: function() {
        return JSON.stringify(this.state);
    },

    __notify: function notifyStateChangeHandler(name, value, oldValue) {
        if (!this.__listeners[name])
            return;

        this.__listeners[name].forEach(function(handler) {
            handler(null, value, oldValue);
        }.bind(this));
    }
};

/**
 * Encapsulate state in a "read-only" object.
 */
function createStoreState(props, observer) {
    var state = {};

    var keeper = Object.keys(props).reduce(function(stateKeeper, key) {
        Object.defineProperty(stateKeeper, key, {
            enumerable: true,
            get: function() {
                return state[key];
            },

            set: function(val) {
                var prevValue = state[key];
                state[key] = val;
                observer(key, val, prevValue);
            }
        });

        return stateKeeper;
    }, {});

    return Object.freeze(keeper);
}


function createStateProps(ctor, props) {
    return Object.keys(props).reduce(function(StateProps, key) {
        
        var properties = {
            store: ctor,
            name: key,
            type: props[key].type,
        };
        
        Object.defineProperty(StateProps, key, {
            enumerable: true,
            get: function() {
                properties.query = function(done) {
                    properties._query = done;
                    return properties;
                }
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
                        state = createStoreState(props.stateProps, this.__notify.bind(this));

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