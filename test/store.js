#!/usr/bin/env node

var test = require("tape");
var Store = require("../lib/store");

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
    var called = 0;

    store.query("example", "_example", function(key, update, orig) {
        return update[0];
    });

    store.observe("example", function(key, update, orig) {
        called++;
    });

    store.observe("_example", function(key, update, orig) {
        called++;
        assert.equal(update, val[0], "Observed queried prop, got expected result");
    });

    store.state.example = val;

    if (called == 2)
        assert.end();

});

test("State can be queried using jsonPath", function(assert) {
    var Foo = Store.create("ExampleStore", {
        stateProps: {
            example: {
                type: function() {},
            }
        }
    });

    var store = new Foo();
    var val = [{
        username: "foo",
        x: true
    }, {
        username: "bar"
    }];

    store.state.example = val;

    var results = store.state.query("example", "$..username");


    assert.deepEqual(results, ["foo", "bar"], "query returned results");

    results = store.state.query("example", "$..bar");

    assert.deepEqual(results, [], "query returned no results");

    results = store.state.query("foo", "$..username");

    assert.deepEqual(results, [], "query returned no results");

    results = store.state.query("example", "$..[?(@.username=='foo')]");

    assert.deepEqual(results, [val[0]], "got expected result");

    assert.end();
});

test("State can be queried using a function", function(assert) {
    var Foo = Store.create("ExampleStore", {
        stateProps: {
            example: {
                type: function() {},
            }
        }
    });

    var store = new Foo();
    var val = [{
        username: "foo",
        x: true
    }, {
        username: "bar"
    }];

    store.state.example = val;

    var results = store.state.query("example", function(key, value) {
        return value.username === "foo";
    });

    assert.deepEqual(results, [val[0]], "got expected result");

    assert.end();
});

test("State can be queried using jsonPath", function(assert) {
    var Foo = Store.create("ExampleStore", {
        stateProps: {
            example: {
                type: ArrayType
            }
        }
    });

    var store = new Foo();
    var val = [{
        username: "foo"
    }, {
        username: "bar"
    }];


    store.query("example", "_example", "$..[?(@.username=='bar')]");

    store.observe("_example", function(key, results, orig) {
        assert.deepEqual(results, [val[1]], "query returned results");
        assert.end();
    });

    store.state.example = val;
});
