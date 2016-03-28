# kabinet
Observable key-value stores for flux apps


## introduction

Kabinet introduces a event-less observable store implementation for flux apps,
introducing flux-stores *without* the use of EventEmitter, based on the 
[Observer pattern](https://en.wikipedia.org/wiki/Observer_pattern) instead.

Stores work as a proxy object between internal state and the outside world, borrowing
concepts from the [object.observe shim](https://github.com/KapIT/observe-shim).

This implementation has the following advantages:

- Each store is an object that can have utility methods to deal with state
- Stores can be used server-side without side-effects
- Easy to reason about stores, as they are just a `require` away
- Simple unit tests can be used to test behaviour of methods
- React compatible input validation

Without *EventEmitter* the binding between stores, components and actions becomes
explicit, making it easier to keep track of what code is acting on changes to your
stores and removing the need for a global `Dispatcher` object. 

Instead, we introduce the use of a singleton to manage stores, explicitly linked
to the actual store implementation by passing around actual objects instead of
strings.

We believe events should not carry any data, thus implementing stores over events
is an [anti-pattern](https://en.wikipedia.org/wiki/Anti-pattern) that should be 
avoided when creating large and complex apps.

## Usage

### Implementing a simple store

```javascript
"use strict";

var React = require("react");

var Foo = Store.create("ExampleStore", {
    stateProps: {
        todos: {
            type: React.PropTypes.arrayOf(React.PropTypes.shape({
              message: React.PropTypes.string,
              created: React.PropTypes.number
            }))
        }
    },
    
    addTodo: function(message){
        this.state.todos = [].concat(this.state.todos, {
            message: message,
            created: Date.now()
        });
    },
    
    getSortedByName: function(){
        return _.sortBy(this.state.todos, "message");
    },
    
    getSortedByDate: function(){
        return _.sortBy(this.state.todos, "created");
    }
});


test("instance foo", function(assert) {

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



```
