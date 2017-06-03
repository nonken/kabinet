"use strict";

const test = require("tape");
const sinon = require("sinon");

import { Store } from './store';
import PropTypes from 'prop-types';

test.skip("Store", function(assert){
    class TestStore extends Store {}
    const store = new TestStore();

    assert.equal(typeof store.setState, 'function', 'setState should be a function');
    assert.equal(typeof store.getState, 'function', 'getState should be a function');
    assert.equal(typeof store.clearState, 'function', 'clearState should be a function');
    assert.equal(typeof store.observe, 'function', 'observe should be a function');
    assert.equal(typeof store.stopObserving, 'function', 'stopObserving should be a function');

    assert.end();
});

test("Store.setState", function(assert){
    class TestStore extends Store {
        static propTypes = {
            things: PropTypes.array
        };
    }

    const store = new TestStore();

    let things = [1,2,3];

    assert.deepEqual(store.getState(), {});
    store.setState("things", things);

    assert.deepEqual(store.getState(), { things: things }, "Thing was stored");

    let copy = store.getState().things;
    copy.push(42);

    assert.deepEqual(store.getState(), { things: things }, "State was immutable");

    let thingsCloned = [].concat(things);
    things.push(43);

    assert.deepEqual(store.getState(), { things: thingsCloned }, "State is not a ref to the original");

    let observer = sinon.spy(console, 'error');
    store.setState("things", {});
    assert.ok(observer.calledWith('Warning: Failed store type: Invalid store `things` of type `object` supplied to `TestStore`, expected `array`.'), 'Validates properties.');

    assert.throws(() => {
        store.setState("others", {});
    }, TypeError, "Cannot add unknown properties");

    let alt = new TestStore();

    assert.notDeepEqual(alt.getState(), store.getState(), "Stores don't share state");

    store.setState({ things: [] });

    assert.end();
});

test("Store.observe", function(assert){
    class TestStore extends Store {
        static propTypes = {
            count: PropTypes.number
        };
    }

    let store = new TestStore();

    let observer = sinon.spy();

    store.observe(observer);

    store.setState("count", 1);

    assert.ok(observer.calledOnce, "Observer was called");

    assert.ok(observer.calledWith({ count: 1 }));

    store.setState("count", 2);

    assert.ok(observer.calledWith({ count: 2 }));

    assert.ok(observer.calledTwice, "Observer called twice");

    assert.end();
});

test("Store.stopObserving", function(assert){
    class TestStore extends Store {
        static propTypes = {
            count: PropTypes.number
        };
    }

    let store = new TestStore();
    let observer = sinon.spy();

    store.observe(observer);
    store.setState("count", 1);

    assert.ok(observer.calledOnce, "Observer was called");

    store.stopObserving(observer);
    store.setState("count", 2);
    assert.ok(observer.calledOnce, "Observer was not called again");

    store.stopObserving(observer);
    assert.pass("Calling stopObserving again did not crash");

    assert.end();
});

test("Store.observers", function(assert){
    class TestStore extends Store {
        static propTypes = {
            count: PropTypes.number
        };
    }

    let store = new TestStore();
    let first = sinon.spy();
    let second = sinon.spy();

    store.observe(first);
    store.observe(second);

    store.setState("count", 2);

    assert.ok(first.calledOnce, "First observer was called");
    assert.ok(second.calledOnce, "Second observer was called");

    store.stopObserving(second);

    store.setState("count", 2);

    assert.ok(first.calledTwice, "First observer called again");
    assert.ok(second.calledOnce, "Second observer was not called");

    assert.end();
});

test("Store.clearState", function(assert){
    class TestStore extends Store {
        static propTypes = {
            count: PropTypes.number
        };
    }

    let store = new TestStore();
    let observer = sinon.spy();
    let count = Math.random();

    store.observe(observer);
    store.setState("count", count);

    assert.ok(observer.calledOnce, "Observer was called");
    assert.ok(observer.calledWith({ count: count }));
    assert.deepEqual(store.getState(), { count: count });

    store.clearState();

    assert.ok(observer.calledTwice, "Observer was called");
    assert.ok(observer.calledWith({}));
    assert.deepEqual(store.getState(), {});

    assert.end();
});