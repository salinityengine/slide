import {
    COMPONENT_ICONS,
    FOLDER_MENU,
} from 'constants';
import editor from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { Signals } from '../../../config/Signals.js';

// import { AddComponentCommand } from '../../../commands/CommandList.js';

class AddComponentButton extends SUEY.Button {

    constructor(entity) {
        super();
        const self = this;

        // Checks
        let hideButton = !entity || !entity.isEntity;
        hideButton = hideButton || entity.locked;
        hideButton = hideButton || entity.userData.flagHelper;
        if (hideButton) return this.setStyle('display', 'none');

        // Setup
        this.addClass('suey-borderless-button');
        this.overflowMenu = SUEY.OVERFLOW.LEFT;
        this.setAttribute('tooltip', 'Add Component');

        // Image
        this.add(new SUEY.ShadowBox(`${FOLDER_MENU}add.svg`).setColor('complement'));

        // Properties
        this.componentMenu = new SUEY.Menu();
        this.attachMenu(this.componentMenu);

        /***** BUILD MENU *****/

        function buildMenu(component) {
            self.componentMenu.clearContents();

            let componentCount = 0;
            const types = SALT.ComponentManager.registeredTypes();
            for (const type of types) {
                const ComponentClass = SALT.ComponentManager.registered(type);
                const config = ComponentClass.config ?? {};
                if (!config.multiple && entity.getComponent(type)) continue;

                // FAMILY: [ 'Entity3D', 'World3D' ]
                if (!config.family) continue;
                const families = Array.isArray(config.family) ? config.family : [ config.family ];
                if (families.indexOf(entity.componentFamily()) === -1) continue;

                // Add Component
                const compName = SUEY.Strings.capitalize(type);
                const compIcon = COMPONENT_ICONS[type] ?? config.icon ?? ``;
                const menuItem = new SUEY.MenuItem(compName, compIcon);
                menuItem.onSelect(() => {
                    const data = {};
                    editor.execute(new AddComponentCommand(entity, type, data));
                });

                // Add to Menu
                self.componentMenu.add(menuItem);
                componentCount++;
            }

            if (componentCount === 0) self.setStyle('display', 'none');
        }

        /***** SIGNALS *****/

        signals.componentChanged.add(buildMenu);

        /***** DESTROY *****/

        this.on('destroy', () => {
            signals.componentChanged.remove(buildMenu);
        });

        /***** INIT *****/

        buildMenu();

    } // end ctor

}

export { AddComponentButton };
