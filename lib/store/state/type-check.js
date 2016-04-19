"use strict";

function typeCheck(type, key, value) {
    if (!type) return;
    
    if (typeof type != "function")
        return console.warn("Expected type for `" + key + "` to be a function, got: " + type);

    /**
     * Custom type checks only expect two arguments.
     * N.B. This is a bit of magick hack, but no
     * other way to detect React types otherwise.
     */
    if (type.length < 3)
        return type(value, key);

    /**
     * Defaults to react types.
     */ 
    var obj = {};
    obj[key] = value;

    return type(obj, key, type.name, "prop");
}

module.exports = typeCheck;