"use strict";

const State = new WeakMap();

let instance;

class Keeper {
    constructor() {
        State.set(this, {
            stores: new Map(),
            storage: {}
        });
    }

    getStore(Store) {
        let state = State.get(this);

        if (!state.stores.has(Store.name)) {
            let store = new Store();

            if (state.storage) {
                store.setState(state.storage[Store.name]);
                store.observe((storeState) => {
                    state.storage[Store.name] = storeState;
                });
            }

            state.stores.set(Store.name, store);
        }

        return state.stores.get(Store.name);
    }

    dehydrate() {
        let state = State.get(this);

        let serializedState = {};
        for (let [name, store] of state.stores) {
            serializedState[name] = store.getState();
        }

        return serializedState;
    }

    hydrate(storage) {
        let stores = State.get(this).stores;
        State.set(this, {
            storage: storage,
            stores: stores
        });
    }
}

Keeper.initInstance = (storage) => {
    instance = new Keeper(storage);
    return instance;
};

Keeper.getInstance = (storage) => {
    if (!instance)
        instance = new Keeper(storage);

    return instance;
};

module.exports = Keeper;