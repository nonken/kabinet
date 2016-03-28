# kabinet
Observable key-value stores for flux apps

## usage

By lack of proper docs for now, the tests contain the best documentation.
The follwong should give a rough idea of how it works:

```javascript

var Store = require("kabinet/store");
var Keeper = require("kabinet/keeper");

var TodoStore = Store.create("Todos", {
    strict: true,
    stateProps: {
        todos: {
            type: React.PropTypes.arrayOf(React.PropTypes.object),
            default: [{
                name: "Example project",
                description: "Just a default project"
            }],
        }
    }
});

// instantiate like a class:

var store = new TodoStore();

// somewhere in a component, instantiate trought keeper:

var keeper = new Keeper();

var store = keeper.getStore(TodoStore);

todo.observe("todos", function(key, value, orig){
    console.log("Updated %s with %s", key, value);
});

// somewhere in an action, keeper has a reference to the instance:
// (pass the keeper as a singleton)

var store = keeper.getStore(TodoStore);

todo.state.push("todos", { name: "new project" });

// on the serverside, flush the keepr:

var json = JSON.stringify(Keeper.dehydrate());

// on the clientside, keeper populates our stores on demand

var keeper = new Keeper(json);

```

## background

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

