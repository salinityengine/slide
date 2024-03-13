import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';

import { AddComponentCommand } from '../../../commands/Commands.js';

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
        this.dom.setAttribute('tooltip', 'Add Component');
        this.add(new SUEY.ShadowBox(`${EDITOR.FOLDER_MENU}add.svg`).addClass('suey-complement-colorize'));

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

                // GROUPS: [ 'Entity3D', 'World3D' ]
                if (!config.group) continue;
                const groups = Array.isArray(config.group) ? config.group : [ config.group ];
                if (groups.indexOf(entity.componentGroup()) === -1) continue;

                // Add Component
                const compName = SALT.Strings.capitalize(type);
                const compIcon = EDITOR.COMPONENT_ICONS[type] ?? config.icon ?? ``;
                const menuItem = new SUEY.MenuItem(compName, compIcon);
                menuItem.onSelect(() => {
                    const data = {};
                    editor.execute(new AddComponentCommand(entity, type, data));
                });

                // Add to Menu
                self.componentMenu.add(menuItem);
                componentCount++;
            }

            // Rebuilding from 'componentChanged' signal?
            if (component && component.isComponent) {
                // // OPTION 1: Select new component tab
                const tabChange = new Event('tab-changed');
                tabChange.value = component.type;
                // // OPTION 2: Stay on current tab when component is added/changed
                // const tabChange = new Event('tab-changed');
                // tabChange.value = editor.inspector.currentId();
                editor.inspector.dom.dispatchEvent(tabChange);
            }

            if (componentCount === 0) self.setStyle('display', 'none');
        }

        /***** SIGNALS *****/

        signals.componentChanged.add(buildMenu);

        /***** DESTROY *****/

        this.dom.addEventListener('destroy', function() {
            signals.componentChanged.remove(buildMenu);
        }, { once: true });

        /***** INIT *****/

        buildMenu();

    } // end ctor

}

export { AddComponentButton };
