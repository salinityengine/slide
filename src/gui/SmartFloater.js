import * as SUEY from 'gui';

import { Layout } from '../config/Layout.js';

class SmartFloater extends SUEY.Floater {

    constructor(id = 'unknown', options = {}) {
        super(id, options);
        const self = this;

        // Remember where Floater was installed (see Layout.js)
        this.on('destroy', () => {
            const dock = self.dock;
            if (dock) {
                const key = `floater/position/${self.id}`;
                const value = {};
                if (dock.hasClass('suey-window')) {
                    value.init = 'center';
                    value.size = dock.dom.style.width;
                    value.size2 = dock.dom.style.height;
                    value.startLeft = dock.dom.style.left;
                    value.startTop = dock.dom.style.top;
                    // value.initialWidth = dock.initialWidth;
                    // value.initialHeight = dock.initialHeight;
                } else if (dock.hasClass('suey-tabbed')) {
                    const docker = SUEY.Dom.parentElementWithClass(dock, 'suey-docker');
                    if (docker) {
                        const rect = docker.dom.getBoundingClientRect();
                        value.init = docker.initialSide;
                        value.side = docker.dockSide;
                        value.size = (value.init === 'left' || value.init === 'right') ? rect.width : rect.height;
                        value.size2 = (value.side === 'left' || value.side === 'right') ? rect.width : rect.height;
                    }
                }
                Layout.setPosition(key, value);
            }
        });

    } // end ctor

}

export { SmartFloater };
