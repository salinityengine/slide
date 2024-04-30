import {
    WIDGET_SPACING,
} from 'constants';
import editor from 'editor';
import * as SALT from 'salt';
import * as SUEY from 'suey';

import { Config } from '../../../config/Config.js';
import { Language } from '../../../config/Language.js';
import { Signals } from '../../../config/Signals.js';

import { SetEntityValueCommand } from '../../../commands/CommandList.js';

class EntityProperties extends SUEY.PropertyList {

    constructor(entity) {
        super('30%');

        /******************** GENERAL */

        // NAME
        const entityName = new SUEY.TextBox().on('change', () => {
            editor.execute(new SetEntityValueCommand(entity, 'name', entityName.getValue()));
        });
        this.addRow(Language.getKey('inspector/entity/name'), entityName);

        // UUID
        const entityUUID = new SUEY.TextBox().setDisabled(true);
        // // 'New' UUID Button
        // const entityUUIDNew = new SUEY.Button('NEW').setStyle('marginLeft', WIDGET_SPACING).onPress(() => {
        //     entityUUID.setValue(SALT.Uuid.generate());
        //     editor.execute(new SetUUIDCommand(entity, entityUUID.getValue()));
        // });
        // // 'Copy' UUID Button
        const entityUUIDCopy = new SUEY.Button('Copy').onPress(() => {
            navigator.clipboard.writeText(entity.uuid).then(
                function() { /* success */ },
                function(err) { console.error('EntityProperties.copy(): Could not copy text to clipboard - ', err); }
            );
        });
        entityUUIDCopy.setStyle('marginLeft', WIDGET_SPACING)
        entityUUIDCopy.setStyle('minWidth', '3.5em');
        if (Config.getKey('promode') === true) {
            this.addRow('UUID', entityUUID, entityUUIDCopy);
        }

        /***** UPDATE *****/

        function updateUI() {
            entityName.setValue(entity.name);
            entityUUID.setValue(entity.uuid);
        }

        /***** SIGNALS *****/

        function entityChangeCallback(changedEntity) {
            if (!changedEntity || !changedEntity.isEntity) return;
            if (changedEntity.uuid === entity.uuid) updateUI();
        };

        Signals.connect(this, 'entityChanged', entityChangeCallback);

        /***** INIT *****/

        updateUI();

        if (entity.locked) this.disableInputs();

    } // end ctor

}

export { EntityProperties };
