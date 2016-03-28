"use strict";

var createState = require("./state");
var test = require("tape");
var proto = require("./state/proto");
var sinon = require("sinon");


test("It should return a frozen object with getters/setters", function(assert) {
    var desc = {
        foo: {},
        bar: {}
    };

    var state = createState(desc);

    assert.deepEqual(Object.keys(desc), Object.keys(state), "State ennumerates all props");
    assert.ok(Object.isFrozen(state), "state is frozen");
    assert.ok(Object.getPrototypeOf(state) == proto, "state has prototype");

    assert.end();
});

test("It should allow getting/setting a value", function(assert) {
    var desc = {
        foo: {
            type: function() {}
        },
    };

    var observer = sinon.stub();
    var val = {
        bar: Math.random()
    };

    var state = createState(desc, observer);

    state.foo = val;

    assert.ok(observer.calledOnce, "observer got called once");
    assert.deepEqual(state.foo, val, "val was set");
    assert.end();
});

test("State has a .get and .set for deep updates", function(assert) {
    var desc = {
        foo: {
            type: function() {}
        },
    };

    var observer = sinon.stub();
    var val = {
        bar: Math.random()
    };

    var state = createState(desc, observer);

    state.set("foo", "bar", val.bar);

    assert.deepEqual(state.foo, val, "val was set");
    assert.equal(state.get("foo", "bar"), val.bar, "Gets deep state");
    assert.ok(observer.calledOnce, "observer got called once");
    assert.end();
});

test("State has a .push for updating array values", function(assert) {
    var desc = {
        foo: {
            type: function() {}
        },
    };

    var observer = sinon.stub();
    var val = {
        bar: Math.random()
    };

    var state = createState(desc, observer);

    state.push("foo", val);
    assert.ok(observer.calledOnce, "observer got called once");
    assert.deepEqual(state.foo, [val], "val was set");

    state.push("foo", val);

    assert.ok(observer.calledTwice, "observer got called twice");
    assert.deepEqual(state.foo, [val, val], "val was set");

    assert.end();
});


test("State supports a default value", function(assert) {
    var observer = sinon.stub();
    var val = {
        biz: Math.random()
    };
    var def = {
        bar: Math.random()
    };

    var desc = {
        bar: {
            type: function() {},
            default: def
        },
        foo: {
            type: function() {},
            default: [def]
        },
    };

    var state = createState(desc, observer);

    assert.ok(observer.notCalled, "observer not called");
    assert.deepEqual(state, {
        foo: [def],
        bar: def
    }, "default was set");

    state.push("foo", val);

    assert.ok(observer.calledOnce, "observer got called once");
    assert.deepEqual(state.foo, [val], "val was set");

    state.set("bar", "bar", val.biz);
    assert.ok(observer.calledTwice, "observer got called twice");

    assert.deepEqual(state, {
        foo: [val],
        bar: {
            bar: val.biz
        }
    }, "state was set");

    state.bar = val;
    assert.ok(observer.calledThrice, "observer got called thrice");

    assert.deepEqual(state, {
        foo: [val],
        bar: val
    }, "state was set");

    assert.end();
});

test("Strict mode enforces typechecks", function(assert) {
    var observer = sinon.stub();

    sinon.spy(console, "error");

    var desc = {
        foo: {
            default: "A default string",
            type: function isString(val, key) {
                if (typeof val == "string")
                    return;

                return new TypeError("Expected value for " + key + " to be a string, got: " + typeof val);
            }
        }
    };

    var state = createState(desc, observer, true);

    state.foo = 1;

    assert.ok(observer.notCalled, "observer not called");
    assert.ok(console.error.calledTwice, "console.error was called twice");

    assert.deepEqual(console.error.getCall(0).args, ['Validation failed for attribute %s with value %s', 'foo', 1]);
    assert.deepEqual(console.error.getCall(1).args, ['Strict warning: not setting %s', 'foo']);

    assert.equal(state.foo, desc.foo.default, "default value still set");

    state.foo = "another string";

    assert.equal(state.foo, "another string", "default was overwritten");
    assert.ok(observer.calledOnce, "observer called");

    assert.end();
});
