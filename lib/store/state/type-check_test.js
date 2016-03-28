"use strict";

var React = require("react");
var test = require("tape");
var check = require("./type-check");
var sinon = require("sinon");

test("It can handle a react type", function(assert){
    var cases = [
        {
            label: "must validate a react string",
            type: React.PropTypes.string,
            value: 1,
            err: new Error("Invalid prop `foo` of type `number` supplied to `bound checkType`, expected `string`."),
        },
        {
            label: "must validate a react string",
            type: React.PropTypes.string,
            value: "a string",
            err: null,
        }    
    ];
    
    cases.forEach(function(testCase){
        var err = check(testCase.type, "foo", testCase.value);
        assert.deepEqual(err, testCase.err, "Got expected error");
    });

    assert.end();
});

test("It can handle a custom type", function(assert){
    function Custom(v, key){
        if(typeof v != "string")
            return new TypeError("Invalid value for " + key + ", expected a string");
    }

    var cases = [
        {
            label: "must validate a string",
            type: Custom,
            value: 1,
            err: new TypeError("Invalid value for foo, expected a string"),
        },
        {
            label: "must validate a react string",
            type: Custom,
            value: "a string",
        }    
    ];
    
    cases.forEach(function(testCase){
        var err = check(testCase.type, "foo", testCase.value);
        assert.deepEqual(err, testCase.err, "Got expected error");
    });

    assert.end();
});

test("It can handle no type", function(assert){
    sinon.spy(console, "warn");
    
    var err = check({}, "foo", 1);

    assert.equal(err, undefined);
    assert.ok(console.warn.calledOnce, "console.warn was called");
    assert.ok(console.warn.calledWith("Expected type for `foo` to be a function, got: [object Object]"), "console.warn called");

    assert.end();
});