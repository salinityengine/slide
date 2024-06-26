import {
    FOLDER_MENU,
} from 'constants';
import editor from 'editor';
import * as SALT from 'salt';
import * as SUEY from 'suey';

import { Signals } from '../../../../config/Signals.js';

class AssetInput {

    static build(propertyList, itemName = '', assetType = 'asset', initialUUID = '', onChange = (value) => {}) {

        // Asset / Prefab Type
        let asset = SALT.AssetManager.get(initialUUID);
        const typeClassName = SUEY.Strings.capitalize(assetType);

        // Widget
        const textBox = new SUEY.TextBox();
        textBox.dom.disabled = true;

        const clearButton = new SUEY.Button();
        clearButton.addClass('suey-property-button');
        clearButton.setAttribute('tooltip', 'Clear');
        clearButton.add(new SUEY.ShadowBox(`${FOLDER_MENU}delete.svg`).setColor(SUEY.TRAIT.TRIADIC1));

        // Event
        textBox.on('pointerdown', () => {
            if (asset) {
                const verifyType = asset.type.toLowerCase();
                Signals.dispatch('assetSelect', verifyType, asset);
            }
        });

        let textBoxValue;
        textBox.on('dragenter', () => {
            if (textBox.hasClass('suey-disabled')) return;
            textBoxValue = textBox.getValue();
            textBox.setValue(`${typeClassName}`);
            const uuid = editor.dragInfo;
            const checkAsset = SALT.AssetManager.get(uuid);
            textBox.addClass(checkItemType(checkAsset) ? 'suey-yes-drop' : 'suey-no-drop');
        });

        textBox.on('dragleave', () => {
            if (textBox.hasClass('suey-disabled')) return;
            textBox.setValue(textBoxValue);
            textBox.removeClass('suey-yes-drop', 'suey-no-drop');
        });

        textBox.on('drop', (event) => {
            textBox.removeClass('suey-yes-drop', 'suey-no-drop');
            event.preventDefault();
            event.stopPropagation();
            if (textBox.hasClass('suey-disabled')) return;
            const uuid = event.dataTransfer.getData('text/plain');
            const checkAsset = SALT.AssetManager.get(uuid);
            if (checkItemType(checkAsset)) {
                asset = checkAsset;
                onChange(uuid);
            }
            updateName();
        });

        clearButton.onPress(() => {
            asset = undefined;
            onChange(null);
            updateName();
        });

        // Helpers
        function checkItemType(asset) {
            if (!asset) return false;
            if (assetType === 'asset') return true;
            return (asset.type.toLowerCase() === assetType);
        }

        function updateName() {
            if (checkItemType(asset)) {
                textBox.addClass('suey-valid-type');
                textBox.removeClass('suey-invalid-type');
                textBox.setValue(asset.name);
            } else {
                textBox.removeClass('suey-valid-type');
                textBox.addClass('suey-invalid-type');
                textBox.setValue('None');
            }
        }

        // Init
        updateName();

        // Push
        return propertyList.addRow(itemName, textBox, clearButton);
    }

}

export { AssetInput };
