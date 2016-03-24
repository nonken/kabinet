"use strict";


function getStateProps(ctor, props, key) {
    return {
        store: ctor,
        name: key,
        type: props[key].type,
    };
}

function createStateProps(ctor, props) {
    return Object.keys(props).reduce(function(StateProps, key) {

        Object.defineProperty(StateProps, key, {
            enumerable: true,
            get: function() {
                var properties = getStateProps(ctor, props, key);
                properties.query = function(query) {
                    properties._query = query;
                    return properties;
                };
                return properties;
            }
        });

        return StateProps;
    }, {});
}

module.exports = createStateProps;