"use strict";

"use server";

require("c9/inline-mocha")(module);

var assert = require("assert");
var Store = require("./store");
var React = require("react");
var StoreKeeper = require("./store-keeper");
var faker = require("faker");

var MockStore = Store.create("mock", {
    stateProps: {
        foo: {
            type: React.PropTypes.string,
        },
    }
});

var MockStore2 = Store.create("mock2", {
    stateProps: {
        bar: {
            type: React.PropTypes.string,
        },
    }
});

describe("store", function() {
    it("StoreKeeper keeps track of stores", function(end) {
        var keeper = new StoreKeeper();
        var instance = keeper.getStore(MockStore);

        assert.ok(instance instanceof MockStore, "keeper created a mockStore");

        var foo = faker.random.uuid();

        instance.state.foo = foo;

        var instance2 = keeper.getStore(MockStore);

        assert.equal(instance.state.foo, foo);
        assert.deepEqual(instance2.state, instance.state, "keeper returned the same store");

        end();
    });

    it("StoreKeeper hydrates the stores", function(end) {
        var foo = faker.random.uuid();
        var keeper = new StoreKeeper({
            mock: {
                foo: foo
            }
        });
        var instance = keeper.getStore(MockStore);

        assert.equal(instance.state.foo, foo, "store was hydrated");

        end();
    });

    it("StoreKeeper de-hydrates the stores", function(end) {
        var foo = faker.random.uuid();
        var bar = faker.random.uuid();
        var expect = {
            mock: {
                foo: foo
            },
            mock2: {
                bar: bar
            }
        };

        var keeper = new StoreKeeper();

        keeper.getStore(MockStore).state.foo = foo;
        keeper.getStore(MockStore2).state.bar = bar;

        assert.deepEqual(keeper.dehydrate(), expect, "stores were de-hydrated");

        end();
    });

    it("StoreKeeper clears the stores", function(end) {
        var foo = faker.random.uuid();
        var bar = faker.random.uuid();
        var expect = {
            mock: {
                foo: foo
            },
            mock2: {
                bar: bar
            }
        };

        var keeper = new StoreKeeper();

        keeper.getStore(MockStore).state.foo = foo;
        keeper.getStore(MockStore2).state.bar = bar;

        assert.deepEqual(keeper.dehydrate(), expect, "stores were de-hydrated");
        
        keeper.clear();
        
        assert.deepEqual(keeper.dehydrate(), {}, "stores were wiped");

        end();
    });
});
