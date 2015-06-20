"use strict";

function createStore(storeName, props) {
    var ctor = function Store(dispatcher) {
        //  @TDOO refactor. State can be passed into the constructor eventually
        // Right now it is "dispatcher".
        // state = state || {};
        
        var state = {};

        var listeners = {};

        Object.defineProperties(this, {
            observe: {
                value: function(attr, handler) {
                    if (!listeners[attr]) {
                        listeners[attr] = [];
                    }

                    listeners[attr].push(handler);
                }
            },

            stopObserving: {
                value: function(attr, handler) {
                    if (!listeners[attr])
                        throw "Fail to unbind " + attr + " for store " + storeName;

                    if (!listeners[attr].indexOf(handler) > -1)
                        return console.warn("Attempt to unbind unitialize attr " + attr + " for store " + storeName);

                    listeners[attr].splice(listeners[attr].indexOf(handler));
                }
            },

            state: {
                ennumerable: true,
                get: function() {
                    return Object.keys(state).reduce(function(clone, key) {
                        clone[key] = state[key];
                        return clone;
                    }, {});
                }
            },

            getState: {
                // todo should go
                value: function getState() {
                    return this.state;
                }
            },

            __setState: {
                value: function __setState(name, value) {
                    // @todo should we "deepClone" value
                    // to prevent action-at-a-distance?
                    state[name] = value;
                    this.notify(name);
                }
            },

            __clearState: {
                value: function clearState() {
                    state = {};

                    Object.keys(listeners).forEach(function(name) {
                        this.notify(name);
                    }.bind(this));
                }
            },

            notify: {
                value: function notifyOnStateChange(name) {
                    if (!listeners[name])
                        return;

                    listeners[name].forEach(function(handler) {
                        handler(null, state[name]);
                    }.bind(this));
                }
            },
            
            hydrate: {
                value: function hydrate(newState){
                    // @TODO this sets state in a undeterminate state
                    // as newState can be anything.
                    state = newState;
                }
            },

            dehydrate: {
                value: function freezeState() {
                    return this.freeze();
                }
            },

            freeze: {
                value: function freezeState() {
                    return JSON.stringify(this.state);
                }
            },
        });
    };

    Object.defineProperty(ctor, "thaw", {
        enumerable: true,
        value: function thawState(state) {
            return new ctor(JSON.parse(state));
        }
    });

    Object.defineProperty(ctor, "storeName", {
        enumerable: true,
        value: storeName
    });

    Object.keys(props).forEach(function(key) {
        var value = props[key];

        Object.defineProperty(ctor, key, {
            get: function() {
                return {
                    store: ctor,
                    type: value.type,
                };
            }
        });
    });

    ctor.prototype = Object.keys(props).reduce(function(proto, key) {
        var value = props[key];

        if (typeof value === 'function') {
            return Object.defineProperty(proto, key, {
                value: value,
                enumerable: true,
            });
        }

        // @TODO
        // Getters and setters directly on protoytpe: 
        // Mabe a separate `state` boject is better. e.g. store.state.attr
        Object.defineProperty(proto, key, {
            enumerable: true,
            get: function() {
                return this.state[key];
            },

            set: function(val) {
                // todo, custom setter can be applied here
                this.__setState(key, val);
            }
        });

        return proto;
    }, {});

    return ctor;
}

module.exports.create = createStore;