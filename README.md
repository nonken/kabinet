# kabinet
Observable key-value stores for flux apps

# Installation

`npm install kabinet`

## Usage

This simple example creates a store and attaches an observer

```javascript

const Store = require("kabinet/store");

let TodoStore = Store.create("TodoStore", {
   todos: Array 
});

let store = new TodoStore();

store.observe((state) => {
    console.log(state); // { todos: ["pick up laundry"] }
})

store.setState("todos", [{title: "pick up laundry"}]);

```

## Advanced usage

To implement the flux pattern, one will need to keep a reference to stores and
attach observers during comonent lifecycle.

(following is pseudo code, see [tests](./store_test.js) for more examples)

```javascript

let React = require("react");
let Store = require("kabinet/store");
let Keeper = require("kabinet/keeper");

/* /lib/store-keeper.js */
let storeKeeper = new Keeper();

module.exports = storeKeeper;

/* /lib/store/todo */
module.exports = Store.create("TodoList", {
    todos: Array
});

/* inside your component, require storeKeeper and store */

class TodoList extends React.component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    
    componentDidMount() {
        storeKeeper.getStore(TodoList).observe(this.setState.bind(this));
    }
    
    componentWillUnmount() {
        storeKeeper.getStore(TodoList).stopObserving(this.setState);
    }
    
    render() {
        if (!this.state.todos)
            return <div>No todo items yet</div>;
        
        return {this.state.todos.map(todo) (
            <TodoItem key={todo.id} todo={todo} />
        )};
    }
};

```

## background

Kabinet introduces a event-less observable store implementation for flux apps,
introducing flux-stores *without* the use of EventEmitter, based on the 
[Observer pattern](https://en.wikipedia.org/wiki/Observer_pattern) instead.

Stores work as a proxy object between internal state and the outside world, borrowing
concepts from the [object.observe shim](https://github.com/KapIT/observe-shim).

This implementation has the following advantages:

- Stores can be used server-side without side-effects
- Easy to reason about stores, as they are just a `require` away
- Simple unit tests can be used to test behaviour of methods
- React compatible input validation

