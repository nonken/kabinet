'use strict';

const State = new WeakMap();
const _ = require('lodash');
import PropTypes from 'prop-types';

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

function observers() {
    let state = State.get(this);
    state.observers.forEach(fn => fn.call(null, this.getState()));
}

export class Store {
    constructor(state) {
        State.set(this, {
            name: this.constructor.name,
            state: state || {},
            observers: new Map()
        });
    }

    getState = () => {
        return clone(State.get(this).state);
    };

    observe = (fn, scope) => {
        State.get(this).observers.set(fn, fn.bind(scope));
    };

    stopObserving = (fn) => {
        State.get(this).observers.delete(fn);
    };

    clearState = () => {
        State.get(this).state = {};
        observers.call(this);
    };

    setState = (name, value) => {
        const propTypes = this.constructor.propTypes;

        let state = State.get(this);
        let newState = name;

        if (value)
            newState = {[name]: value};

        PropTypes.checkPropTypes(this.constructor.propTypes, newState, 'store', state.name);

        for (let key in newState) {
            if (!(key in propTypes)) {
                throw new TypeError(`unknown property "${name}" for ${state.name}`);
            }

            state.state[key] = clone(newState[key]);
        }

        observers.call(this);
    };
}