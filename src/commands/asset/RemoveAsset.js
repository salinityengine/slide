import * as SALT from 'engine';
import * as SUEY from 'gui';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class RemoveAssetCommand extends Command {

    constructor(asset) {
        super();
        this.type = 'RemoveAssetCommand';

        this.assetType = SALT.AssetManager.checkType(asset);
        this.brief = `Remove ${SUEY.Strings.capitalize(this.assetType)}`;
        if (asset.name && asset.name !== '') this.brief += `: ${asset.name}`;

        this.asset = asset;
        this.wasRemoved = false;

        // Cancel if no uuid
        if (!asset.uuid) {
            this.valid = false;
            console.warn(`RemoveAssetCommand.constructor(): Asset has no uuid - `, asset);
        }
    }

    purge() {
        if (this.wasRemoved && this.asset && typeof this.asset.dispose === 'function') this.asset.dispose();
    }

    execute() {
        if (SALT.AssetManager.get(this.asset.uuid)) {
            SALT.AssetManager.remove(this.asset, false /* dispose */);
            this.wasRemoved = true;
            Signals.dispatch('assetRemoved', this.assetType, this.asset);
            Signals.dispatch('inspectorClear');
        }
    }

    undo() {
        if (this.wasRemoved) {
            SALT.AssetManager.add(this.asset);
            this.wasRemoved = false;
            Signals.dispatch('assetAdded', this.assetType, this.asset);
            Signals.dispatch('assetSelect', this.assetType, this.asset);
            Signals.dispatch('inspectorClear');
        }
    }

}

export { RemoveAssetCommand };
