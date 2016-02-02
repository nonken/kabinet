/**
 * Shared prototype of all Stores, e.g. baseclass.
 */
 
function jsonPathHandler(store, path){
    return function(key, value, orig){
        return store.state.query(key, path);
    };
}
 
 
var StoreStateBasePrototype = {
    getState: function getState() {
        return this.state;
    },

    clearState: function(){
        for ( var key in this.state ){
            this.state[key] = null;
        }
    },
    
    query: function(attr, name, handler){
        if(typeof handler === "string")
            handler = jsonPathHandler(this, handler);

        this.observe(attr, function(key, value, orig){
            this.__notify(name, handler(key, value, orig));            
        }.bind(this));
    },

    observe: function(attr, handler) {
        if (!this.__listeners[attr]) {
            this.__listeners[attr] = [];
        }

        this.__listeners[attr].push(handler);
    },

    stopObserving: function(attr, handler) {
        if (!this.__listeners[attr])
            throw "Fail to unbind " + attr + " for store " + this.storeName;
            
        if (!this.__listeners[attr].indexOf(handler) === -1)
            return console.warn("Attempt to unbind unitialize attr " + attr + " for store " + this.storeName);

        this.__listeners[attr].splice(this.__listeners[attr].indexOf(handler));
    },

    hydrate: function hydrate(newState) {
        for (var key in this.state) {
            this.state[key] = newState[key];
        }
    },

    dehydrate: function() {
        return this.state;
    },
    
    __notify: function notifyStateChangeHandler(name, value, oldValue) {
        if (!this.__listeners[name])
            return;

        this.__listeners[name].forEach(function(handler) {
            handler(name, value, oldValue);
        }.bind(this));
    }
};

module.exports = StoreStateBasePrototype;