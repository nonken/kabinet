"use strict";

/**
 * Simple factory/cache
 */
function StoreKeeper(storeData) {
    var _stores = {};
    
    storeData = storeData || {};

    this.getStore = function(store, fluxContext) {
        var storeName = store.storeName || store.name;
        
        fluxContext = fluxContext || {};

        if (!storeName) throw new Error("Store needs to have a name");
        if (_stores[storeName]) return _stores[storeName];

        var storeInstance = _stores[storeName] = new store();
        storeInstance.context = fluxContext;
        

        if (storeData[storeName])
            storeInstance.hydrate(storeData[storeName]);

        return storeInstance;
    };
    
    this.dehydrate = function(){
        var data = {};
        for (var name in _stores) {
            data[name] = _stores[name].dehydrate();
        }

        return data;
    };

    this.clear = function() {
        _stores = {};
    };
};

module.exports = StoreKeeper;
