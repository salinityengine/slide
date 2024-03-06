import { ASSET_TYPES } from '../constants.js';

const _assets = {};

class AssetManager {

    /******************** MANAGER */

    static clear() {
        for (const uuid in _assets) {
            const asset = _assets[uuid];
            if (asset.isBuiltIn) continue; /* keep built-in assets */
            AssetManager.removeAsset(_assets[uuid], true);
        }
    }

    /******************** ASSETS */

    static addAsset(asset) {
        const assets = Array.isArray(asset) ? asset : [...arguments];
        let returnAsset = undefined;
        for (let i = 0; i < assets.length; i++) {
            let asset = assets[i];

            // Checks
            if (!asset || !asset.uuid) continue;

            // Ensure asset has a Name
            if (!asset.name || asset.name === '') asset.name = asset.constructor.name;

            // Add Asset
            _assets[asset.uuid] = asset;
            if (returnAsset === undefined) returnAsset = asset;
        }
        return returnAsset;
    }

    static getAsset(uuid) {
        if (uuid && uuid.uuid) uuid = uuid.uuid;
        return _assets[uuid];
    }

    /** Retrieve a collection of Asset sub types by Category */
    static getLibrary(type, category) {
        const library = [];
        for (const [uuid, asset] of Object.entries(_assets)) {
            if (type && asset.type !== type) continue;
            if (category == undefined || (asset.category && asset.category === category)) {
                library.push(asset);
            }
        }
        return library;
    }

    static removeAsset(asset, dispose = true) {
        const assets = Array.isArray(asset) ? asset : [ asset ];
        for (const asset of assets) {
            if (!asset || !asset.uuid) continue;

            // Remove if present
            if (_assets[asset.uuid]) {
                // Dispose, Remove
                if (dispose && typeof asset.dispose === 'function') asset.dispose();
                delete _assets[asset.uuid];
            }
        }
    }

    /******************** JSON */

    static fromJSON(json, onLoad = () => {}) {
        // Clear Assets
        AssetManager.clear()

        // Load Assets
        for (const type of ASSET_TYPES) {
            if (!json[type]) continue;
            for (const assetData of json[type]) {
                const asset = new (eval(assetData.object.type))();
                asset.fromJSON(assetData);
                AssetManager.addAsset(asset);
            }
        }

        // Loaded
        if (typeof onLoad === 'function') {
            onLoad();
        }
    }

    static toJSON(meta) {
        const json = {};

        if (!meta) meta = {};

        // Save Assets
        for (const type of ASSET_TYPES) {
            const assets = AssetManager.getLibrary(type);
            if (assets.length === 0) continue;
            meta[type] = {};
            for (const asset of assets) {
                if (!asset.uuid || meta[type][asset.uuid]) continue;
                meta[type][asset.uuid] = asset.toJSON();
            }
        }

        // Add 'meta' caches to 'json' as arrays
        for (const library in meta) {
            const valueArray = [];
            for (const key in meta[library]) {
                const data = meta[library][key];
                delete data.metadata;
                valueArray.push(data);
            }
            json[library] = valueArray;
        }

        return json;
    }

}

export { AssetManager };