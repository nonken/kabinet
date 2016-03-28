"use strict";


function getMetaProp(ctor, props, key) {
    return {
        store: ctor,
        name: key,
        type: props[key].type,
    };
}

function metaStore(ctor, props) {
    return Object.keys(props).reduce(function(metaProps, key) {

        Object.defineProperty(metaProps, key, {
            enumerable: true,
            get: function() {
                var properties = getMetaProp(ctor, props, key);

                properties.query = function(query) {
                    properties._query = query;
                    return properties;
                };

                return properties;
            }
        });

        return metaProps;
    }, {});
}

module.exports = metaStore;