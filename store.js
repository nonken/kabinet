"use strict";

const State = new WeakMap();
const _ = require('lodash');

const clone = (value) => {
    if (Array.isArray(value))
        return value.map(clone);

    if (_.isPlainObject(value))
        return Object.keys(value).reduce((o, key) => {
            return Object.assign(o, {
                [key]: clone(value[key])
            });
        }, {});

    return value;
};

const check = (name, type, value) => {
    if (/^(Boolean|Number|String|RegExp|Array|Object|Date|Function)$/.test(type.name)) {
        if (typeof value === type.name.toLowerCase()) return true;
        if ((value instanceof type)) return true;
        throw new TypeError(`type of ${name} must be ${type.name}, not ${typeof value}`);
    }
};

function observers() {
    let state = State.get(this);
    state.observers.forEach(fn => fn.call(null, this.getState()));
}

const proto = {
    getState() {
        return clone(State.get(this).state);
    },

    observe(fn, scope) {
        State.get(this).observers.set(fn, fn.bind(scope);
    },

    stopObserving(fn) {
        State.get(this).observers.delete(fn);
    },

    clearState() {
        State.get(this).state = {};
        observers.call(this);
    },

    setState(name, value) {
        let state = State.get(this);
        let newState = name;

        if (arguments.length == 2)
            newState = {[name]: value};

        for (let key in newState) {
            if (!(key in state.storeProps))
                throw new TypeError(`unknown property "${name}" for ${state.name}`);
            check(key, state.storeProps[key], newState[key]);
            state.state[key] = clone(newState[key]);
        }

        observers.call(this);
    }
};

module.exports.create = function create(name = "StoreName", storeProps = {}) {
    check('first argument "name"', String, name);
    check('second argument "storeProps"', Object, storeProps);

    const ctor = function(state) {
        State.set(this, {
            name: name,
            state: state || {},
            observers: new Map(),
            storeProps: storeProps
        });
    };

    ctor.prototype = Object.create(proto);

    return Object.defineProperty(ctor, "name", {
        value: name
    });
};
