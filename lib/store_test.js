#!/usr/bin/env node

var test = require("tape");
var Store = require("./store");
var sinon = require("sinon");

function ArrayType(val) {
    if (!Array.isArray(val))
        return new Error("noop");
}

test("Creates a store object", function(assert) {
    var Foo = Store.create("ExampleStore", {
        stateProps: {
            example: {
                type: function() {},
            }
        }
    });

    var store = new Foo();

    store.state.example = [1, 2, 3];
    assert.deepEqual(store.state.example, [1, 2, 3]);

    assert.end();
});

test("instance foo", function(assert) {
    var Foo = Store.create("ExampleStore", {
        stateProps: {
            example: {
                type: function() {},
            }
        }
    });

    var store = new Foo();

    var store2 = new Foo();

    store2.observe("example", function() {
        assert.fail("should not happen");
    });

    store.observe("example", function() {
        assert.end();
    });

    store.state.example = 1;

});

test("Store is observable", function(assert) {
    var Foo = Store.create("ExampleStore", {
        stateProps: {
            example: {
                type: function() {},
            }
        }
    });

    var store = new Foo();
    var val = [1, 2, 3];

    store.observe("example", function(key, update, orig) {
        assert.deepEqual(update, val, "received updated value");
        assert.equal(orig, undefined, "original was undefined");
        assert.equal(key, "example", "got key back");
        assert.end();
    });

    store.state.example = val;
});

test("Store can be strict observable", function(assert) {
    var Foo = Store.create("ExampleStore", {
        strict: true,
        stateProps: {
            example: {
                type: ArrayType
            }
        }
    });

    var store = new Foo();
    var val = [1, 2, 3];

    store.observe("example", function(key, update, orig) {
        assert.deepEqual(update, val, "received updated value");
        assert.equal(orig, undefined, "original was undefined");
        assert.equal(key, "example", "got key back");
        assert.end();
    });

    store.state.example = 1;
    store.state.example = val;
});

test("Store supports query function", function(assert) {
    var Foo = Store.create("ExampleStore", {
        strict: true,
        stateProps: {
            example: {
                type: function(val) {
                    if (!Array.isArray(val))
                        return new Error("noop");
                },
            }
        }
    });

    var store = new Foo();
    var val = [1, 2, 3];

    store.query("example", "_example", function(key, update, orig) {
        return update[0];
    });

    var observer = sinon.stub();

    store.observe("example", observer);
    store.observe("_example", observer);

    store.state.example = val;


    assert.deepEqual(observer.getCall(0).args, ["_example", val[0], undefined]);
    assert.deepEqual(observer.getCall(1).args, ["example", val, undefined]);

    store.state.example = {};

    assert.equal(observer.getCall(2), null);


    assert.end();

});
