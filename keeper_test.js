"use strict";

var Store = require("./store");
var StoreKeeper = require("./keeper");
var faker = require("faker");

var test = require("tape");

var MockType = function() {
    return;
};

var MockStore = Store.create("mock", {
    stateProps: {
        foo: {
            type: MockType,
        },
    }
});

var MockStore2 = Store.create("mock2", {
    stateProps: {
        bar: {
            type: MockType,
        },
    }
});

test("StoreKeeper keeps track of stores", function(assert) {
    var keeper = new StoreKeeper();
    var instance = keeper.getStore(MockStore);

    assert.ok(instance instanceof MockStore, "keeper created a mockStore");

    var foo = faker.random.uuid();

    instance.state.foo = foo;

    var instance2 = keeper.getStore(MockStore);

    assert.equal(instance.state.foo, foo);
    assert.deepEqual(instance2.state, instance.state, "keeper returned the same store");

    assert.end();
});

test("StoreKeeper hydrates the stores", function(assert) {
    var foo = faker.random.uuid();
    var keeper = new StoreKeeper({
        mock: {
            foo: foo
        }
    });
    var instance = keeper.getStore(MockStore);

    assert.equal(instance.state.foo, foo, "store was hydrated");

    assert.end();
});

test("StoreKeeper de-hydrates the stores", function(assert) {
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

    assert.end();
});

test("StoreKeeper clears the stores", function(assert) {
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

    assert.end();
});
