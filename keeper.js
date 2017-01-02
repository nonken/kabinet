"use strict";

const State = new WeakMap();

let instance;

class Keeper {
    constructor(storage) {
        State.set(this, {
            storage: storage,
            stores: new Map(),
        });
    }

    getStore(Store) {
        let state = State.get(this);

        if (!state.stores.has(Store.name)) {
            let store = new Store();

            if (state.storage) {
                store.setState(state.storage.get(Store.name));
                store.observe((storeState) => {
                    state.storage.set(Store.name, storeState);
                });
            }

            state.stores.set(Store.name, store);

        }

        return state.stores.get(Store.name);
    }

    serialize() {
        let state = State.get(this);

        return state.stores.keys().reduce((o, k) => {
            return Object.assign(o, {
                [k]: state.stores.get(k)
            });
        }, {});

    }
}

Keeper.initInstance = (storage) => {
    instance = new Keeper(storage);
    return instance;
};

Keeper.getInstance = () => {
    if (!instance)
        instance = new Keeper();

    return instance;
};

module.exports = Keeper;
