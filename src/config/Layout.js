import {
    EDITOR_MODES,
} from 'constants';
import * as SUEY from 'gui';
import { Config } from './Config.js';
import { Signals } from './Signals.js';

import { Advisor } from '../floaters/Advisor.js';
import { Assets } from '../floaters/Assets.js';
import { Codex } from '../floaters/Codex.js';
import { Historian } from '../floaters/Historian.js';
import { Inspector } from '../floaters/Inspector.js';
import { Library } from '../floaters/Library.js';
import { Outliner } from '../floaters/Outliner.js';
import { Player } from '../floaters/Player.js';
import { Previewer } from '../floaters/Previewer.js';
import { Projecter } from '../floaters/Projecter.js';
import { Scripter } from '../floaters/Scripter.js';
import { Settings } from '../floaters/Settings.js';
import { Shaper } from '../floaters/Shaper.js';

class Layout {

    /******************** CONSTRUCT */

    static default(docker, viewport) {
        // Clear Docker
        docker.clearDocks();

        // Checks
        if (!viewport) {
            console.warn('Layout.default(): Editor viewport not provided!');
            return;
        }

        // Floaters Wanted
        const defaultFloaters = [
            'outliner',
            'assets',
            'library',
            'codex',
            'advisor',
            'inspector',
            'previewer',
        ];

        // Install Floaters
        const allowed = viewport.floaterFamily();
        for (const floaterName of defaultFloaters) {
            if (allowed.includes(floaterName)) {
                Layout.installFloater(docker, Layout.createFloater(floaterName));
            }
        }

        // Clear Inspector / Previewer
        Signals.dispatch('inspectorClear');
        Signals.dispatch('previewerClear');
    }

    /******************** FLOATERS */

    static allFloaters() {
        const floaters = {
            'advisor':      Advisor,
            'assets':       Assets,
            'codex':        Codex,
            'history':      Historian,
            'inspector':    Inspector,
            'library':      Library,
            'outliner':     Outliner,
            'player':       Player,
            'previewer':    Previewer,
            'project':      Projecter,
            'scripter':     Scripter,
            'settings':     Settings,
        };
        return floaters;
    }

    static createFloater(id) {
        const floaters = Layout.allFloaters();
        if (id in floaters) return new floaters[id];
        console.warn(`Layout.createFloater(): Unknown type '${id}'`);
        return null;
    }

    static installFloater(docker, floater) {
        const installInfo = Config.getKey(`floater/initial/${floater?.id}`) ?? { init: 'center', side: null, size: '20%' };
        const installInit = installInfo?.init ?? 'center';
        const installSide = installInfo?.side ?? installInit;
        const installSize = (installInfo && installInfo.size && installInfo.size !== '') ? installInfo.size : '20%';
        const installSize2 = installInfo?.size2 ?? installSize;

        let dock = undefined;
        switch (installInit) {
            // Add Dock
            case 'left': case 'right': case 'top': case 'bottom':
                // Docker Traversal Function
                function findDocker(parentDocker, property, value, recursive = true) {
                    const queue = [ parentDocker ];
                    while (queue.length > 0) {
                        const currentElement = queue.shift();
                        for (const child of currentElement.children) {
                            if (child[property] === value) {
                                if (SUEY.Dom.childWithClass(child, 'suey-tabbed', false /* recursive? */)) {
                                    return child;
                                }
                            }
                            if (recursive) queue.push(child);
                        }
                    }
                    return null;
                }
                // Find / Create initial Docker and sub Docker
                let initialDocker = findDocker(docker, 'initialSide', installInit, true);
                initialDocker = initialDocker ?? docker.addDock(installInit, installSize);
                if (installInit === installSide) {
                    dock = initialDocker.enableTabs();
                } else {
                    let subDocker = findDocker(initialDocker, 'dockSide', installSide, true);
                    subDocker = subDocker ?? initialDocker.addDock(installSide, installSize2);
                    dock = subDocker.enableTabs();
                }
                break;
            // Create Window
            case 'center':
            default:
                const width = installInfo?.size ?? '50%';
                const height = installInfo?.size2 ?? '70%';
                const startLeft = installInfo?.startLeft;
                const startTop = installInfo?.startTop;
                const startCentered = (startLeft == null && startTop == null);
                dock = new SUEY.Window({ title: floater.id, width, height, startCentered });
                docker.addToSelf(dock);
                dock.display();
                if (!startCentered) dock.setStyle('left', SUEY.Css.toPx(startLeft, null, 'w'), 'top', SUEY.Css.toPx(startTop, null, 'h'));
        }
        dock.addTab(floater);
    }

    static removeFloater(floater) {
        if (floater && floater.isElement) {
            const dock = floater.dock;
            floater.destroy();
            if (dock) dock.removeTab(floater);
        }
    }

    /******************** SAVE / LOAD */

    static save(docker, viewport) {
        // Checks
        if (!docker.isPrimary()) {
            console.warn('Layout.save(): The provided Docker is not the Primary Docker');
            return;
        }
        if (!viewport) {
            console.warn('Layout.save(): Editor viewport not provided!');
            return;
        }

        // Docker Traversal
        function traverse(currentDocker, parentLayout) {
            const reverseChildren = currentDocker.children.toReversed();
            reverseChildren.forEach(child => {
                // Docker
                if (child.hasClass('suey-docker')) {
                    const dockerLayout = {
                        type: 'docker',
                        initialSide: child.initialSide,
                        collapsed: child.hasClass('suey-collapsed'),
                        side: child.dockSide,
                        size: (child.dockSide === 'left' || child.dockSide === 'right') ? child.dom.style.width : child.dom.style.height,
                        children: [],
                    };
                    if (dockerLayout.collapsed) dockerLayout.size = child.expandSize;
                    parentLayout.children.push(dockerLayout);
                    traverse(child, dockerLayout);
                // Tabbed
                } else if (child.hasClass('suey-tabbed')) {
                    const spacers = SUEY.Dom.childrenWithClass(currentDocker, 'suey-flex-spacer', false /* recursive? */);
                    const tabbedLayout = {
                        type: 'tabbed',
                        selectedID: child.selectedID,
                        hasSpacer: (spacers.length > 0),
                        floaters: SUEY.Dom.childrenWithClass(child, 'suey-tab-button', true /* recursive? */).map(button => button.id),
                    };
                    parentLayout.children.push(tabbedLayout);
                // Window
                } else if (child.hasClass('suey-window')) {
                    const windowLayout = {
                        type: 'window',
                        active: child.hasClass('suey-active-window'),
                        left: child.dom.style.left,
                        top: child.dom.style.top,
                        width: child.dom.style.width,
                        height: child.dom.style.height,
                        initialWidth: child.initialWidth,
                        initialHeight: child.initialHeight,
                        floaters: SUEY.Dom.childrenWithClass(child, 'suey-floater', true /* recursive? */).map(floater => floater.id),
                    };
                    parentLayout.children.push(windowLayout);
                }
            });
        }

        // Build Layout Tree
        const layout = {
            type: 'docker',
            side: 'center',
            children: [],
        };
        traverse(docker, layout);

        // Save the Layout
        localStorage.removeItem(`dockerLayout/${viewport.mode()}`);
        localStorage.setItem(`dockerLayout/${viewport.mode()}`, JSON.stringify(layout));
    }

    static load(docker, viewport) {
        // Clear Docker
        docker.clearDocks();

        // Checks
        if (!docker.isPrimary()) {
            console.warn('Layout.load(): The provided Docker is not the Primary Docker');
            return;
        }
        if (!viewport) {
            console.warn('Layout.load(): Editor viewport not provided!');
            return;
        }

        // Retrieve the layout from localStorage
        const layoutData = localStorage.getItem(`dockerLayout/${viewport.mode()}`);
        if (!layoutData) {
            Layout.default(docker, viewport);
            return;
        }

        function createDocker(layoutNode, parentDocker) {
            let activeWindow = undefined;
            let addedDock = false;
            let twinDocker = undefined;
            layoutNode.children.forEach(childNode => {

                if (childNode.type === 'docker') {
                    if (!addedDock) {
                        const newDocker = parentDocker.addDock(childNode.side, childNode.size);
                        if (childNode.collapsed) newDocker.collapseTabs();
                        twinDocker = newDocker.getTwin();
                        createDocker(childNode, newDocker);
                        addedDock = true;
                    } else if (twinDocker) {
                        if (childNode.collapsed) twinDocker.collapseTabs();
                        createDocker(childNode, twinDocker.contents());
                    }

                } else if (childNode.type === 'tabbed') {
                    const tabbed = parentDocker.enableTabs(childNode.hasSpacer /* flexBefore? */);
                    childNode.floaters.forEach(floaterID => tabbed.addTab(Layout.createFloater(floaterID)));
                    tabbed.selectTab(childNode.selectedID);

                } else if (childNode.type === 'window') {
                    childNode.floaters.forEach(floaterID => {
                        const floater = Layout.createFloater(floaterID);
                        if (floater) {
                            const window = new SUEY.Window({
                                title: floaterID,
                                width: childNode.width,
                                height: childNode.height,
                                initialWidth: childNode.initialWidth,
                                initialHeight: childNode.initialHeight,
                                startCentered: false,
                                left: childNode.left,
                                top: childNode.top,
                            });
                            parentDocker.addToSelf(window);
                            window.display();
                            window.addTab(floater);
                            window.selectTab(floaterID);
                            if (childNode.active) activeWindow = window;
                        }
                    });
                }
            });
            if (activeWindow) activeWindow.focus();
        }

        // Build Docker
        const layout = JSON.parse(layoutData);
        createDocker(layout, docker);
    }

}

export { Layout };
