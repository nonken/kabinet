#!/usr/bin/env node

var test = require("tape");
var Store = require("../lib/store");

test("Creates a store object", function(assert){
    var Foo = Store.create("ExampleStore", {
        stateProps: {
            example: {
                type: function(){},
            }
        }
    });
    
    var store = new Foo();
    
    store.state.example = [1,2,3];
    assert.deepEqual(store.state.example, [1, 2, 3]);
    
    assert.end();
});

test("Store is observable", function(assert){
    var Foo = Store.create("ExampleStore", {
        stateProps: {
            example: {
                type: function(){},
            }
        }
    });

    var store = new Foo();
    var val = [1,2,3];
    
    store.observe("example", function(key, update, orig){
        assert.deepEqual(update, val, "received updated value");
        assert.equal(orig, undefined, "original was undefined");
        assert.equal(key, "example", "got key back");
        assert.end();
    });

    store.state.example = val;
});

test("Store can be strict observable", function(assert){
    var Foo = Store.create("ExampleStore", {
        strict: true,
        stateProps: {
            example: {
                type: function(val){
                    if(!Array.isArray(val))
                        return new Error("noop");
                },
            }
        }
    });

    var store = new Foo();
    var val = [1,2,3];

    store.observe("example", function(key, update, orig){
        assert.deepEqual(update, val, "received updated value");
        assert.equal(orig, undefined, "original was undefined");
        assert.equal(key, "example", "got key back");
        assert.end();
    });
    
    store.state.example = 1;

    store.state.example = val;
});