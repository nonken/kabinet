#!/usr/bin/env node

"use strict";
"use mocha";
"use server";

require("c9/inline-mocha")(module);

var assert = require("assert");
var Store = require("./store");
var React = require("react");

describe("store", function() {
    it("should create a store obect", function() {

        var Foo = Store.create("ExampleStore", {
            example: {
                type: React.PropTypes.array,
            }
        });

        assert.equal(Foo.storeName, "ExampleStore");
        assert.equal(Foo.example.store.storeName, Foo.storeName, 'We can get the original storeName');

        var f = new Foo({
            example: [1, 2, 3]
        });

        assert.deepEqual(f.example, [1, 2, 3]);
    });
});
