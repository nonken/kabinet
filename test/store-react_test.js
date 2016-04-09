"use strict";

var test = require("tape");
var Store = require("../store");
var React = require("react");
var sortBy = require("lodash/sortBy");
var sinon = require("sinon");

test("It can use react types and methods", function(assert){
    var TodoStore = Store.create("TodoStore", {
        strict: true,
        stateProps: {
            foo: {
                default: function(){
                    return new Date();
                }
            },
            todos: {
                default: [],
                type: React.PropTypes.arrayOf(React.PropTypes.shape({
                  message: React.PropTypes.string.isRequired,
                  created: React.PropTypes.number.isRequired
                })).isRequired
            }
        },
        
        addTodo: function(message){
            this.state.push("todos", {
                message: message,
                created: Date.now()
            });
        },
        
        getSortedByName: function(){
            return sortBy(this.state.todos, "message");
        },
        
        getSortedByDate: function(){
            return sortBy(this.state.todos, "created");
        }
    });  
    
    var store = new TodoStore();
    
    var observer = sinon.stub();
    
    store.observe("todos", observer);
    
    store.addTodo("buy new lightbulbs");
    store.addTodo("add more spices");
    
    assert.ok(observer.calledTwice, "update called");

    assert.end();
});
