"use strict";

function typeCheck(type, key, value) {
    if (!type) return;

    // first check if this is a React type
    if (type.name == "bound checkType") {
        var obj = {};
        obj[key] = value;

        return type(obj, key, type.name, "prop");
    }

    if (typeof type == "function")
        return type(value, key);

    console.warn("Expected type for `" + key + "` to be a function, got: " + type);
}

module.exports = typeCheck;