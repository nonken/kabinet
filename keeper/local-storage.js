module.exports = {
    set: function(name, value) {
        window.sessionStorage.setItem(name, JSON.stringify(value));
    },
    get: function(name) {
        var val = window.sessionStorage.getItem(name);
        if (val) return JSON.parse(val);
    }
};
