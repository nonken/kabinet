"usee strict";

var React = require('react');
var hoistNonReactStatics = require('hoist-non-react-statics');
var _ = require('lodash');

module.exports = function StoreConnect(def) {
    if (!def.storeProps)
        throw "You should now wrap a component without storeProps";

    var name = def.displayName || "";

    var Wrapper = React.createClass({

        displayName: name + "StoreWrapper",

        contextTypes: {
            getStore: React.PropTypes.func.isRequired,
        },

        getInitialState: function() {
            return this.getStateFromStores();
        },

        componentDidMount: function componentDidMount() {
            this._getStores().forEach(function(kv) {
                kv.store.observe(kv.attribute, this._onStoreChange);
            }, this);
        },

        componentWillUnmount: function componentWillUnmount() {
            this._getStores().forEach(function(kv) {
                kv.store.stopObserving(kv.attribute, this._onStoreChange);
            }, this);
        },

        _getStores: function(handle) {
            return Object.keys(def.storeProps).map(function(key) {
                return {
                    store: this.context.getStore(def.storeProps[key].store),
                    attribute: key,
                };
            }, this);
        },

        _onStoreChange: function onStoreChange() {
            if (!this.isMounted())
                return;

            this.setState(this.getStateFromStores());
        },

        getStateFromStores: function() {
            return this._getStores().reduce(function(state, kv) {
                state[kv.attribute] = kv.store.state[kv.attribute];
                return state;
            }.bind(this), {});
        },

        render: function() {
            console.log(React.createClass(def), 'hello');
            return React.createElement(React.createClass(def), _.assign({}, this.props, this.state));
        }
    });

    return hoistNonReactStatics(Wrapper, def);
};
