import * as SALT from 'engine';
import { Command } from '../Command.js';

class AddAssetCommand extends Command {

    constructor(asset) {
        super();

        this.type = 'AddAssetCommand';

        this.assetType = ONE.AssetManager.checkType(asset);
        this.name = `Add ${ONE.Strings.capitalize(this.assetType)}`;
        if (asset.name && asset.name !== '') this.name += `: ${asset.name}`;

        this.asset = asset;
        this.wasAdded = false;

        // Cancel if no uuid
        if (!asset.uuid) {
            this.valid = false;
            console.warn(`AddAssetCommand: Asset has no uuid, asset is as follows:`);
            console.log(asset);
        }
    }

    invalid() {
        this.purge();
    }

    purge() {
        if (!this.wasAdded && this.asset && typeof this.asset.dispose === 'function') this.asset.dispose();
    }

    execute() {
        if (!ONE.AssetManager.getAsset(this.asset.uuid)) {
            ONE.AssetManager.addAsset(this.asset);
            this.wasAdded = true;
            if (ONE.MESH_REBUILD_TYPES.indexOf(this.assetType) !== -1) {
                editor.project.traverseWorlds((child) => child.rebuildComponents());
            }
            signals.assetAdded.dispatch(this.assetType, this.asset);
            signals.assetSelect.dispatch(this.assetType, this.asset);
            signals.inspectorBuild.dispatch();
            signals.previewerBuild.dispatch();
        }
    }

    undo() {
        if (this.wasAdded) {
            ONE.AssetManager.removeAsset(this.asset, false /* dispose */);
            this.wasAdded = false;
            if (ONE.MESH_REBUILD_TYPES.indexOf(this.assetType) !== -1) {
                editor.project.traverseWorlds((child) => child.rebuildComponents());
            }
            signals.assetRemoved.dispatch(this.assetType, this.asset);
            signals.inspectorBuild.dispatch();
            signals.previewerBuild.dispatch();
        }
    }

}

export { AddAssetCommand };