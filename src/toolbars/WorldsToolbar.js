import {
    COLORS,
    EDITOR_MODES,
    FOLDER_MENU,
    FOLDER_TOOLBAR,
} from 'constants';
import editor from 'editor';
import * as SALT from 'salt';
import * as SUEY from 'suey';

import { Advice } from '../config/Advice.js';
import { Config } from '../config/Config.js';
import { Signals } from '../config/Signals.js';

import { AddEntityCommand, SelectCommand } from '../commands/CommandList.js';
import { MultiCmdsCommand } from '../commands/CommandList.js';
import { SetStageCommand } from '../commands/CommandList.js';

class WorldsToolbar {

    constructor(worldsGraph) {

        /******************** BUTTONS */

        // Nodes
        const add = new SUEY.ToolbarButton();

        // Focus
        const reset = new SUEY.ToolbarButton();

        // Grid
        const gridSnap = new SUEY.ToolbarButton();

        /******************** TOOLTIPS */

        // Nodes
        add.setAttribute('tooltip', 'Add Node');

        // Focus
        reset.setAttribute('tooltip', Config.tooltip('Reset View', Config.getKey('shortcuts/camera/reset')));

        // Grid
        gridSnap.setAttribute('tooltip', Config.tooltip('Snap to Grid?', 'g'));

        /******************** ADVISOR */

        // Nodes
        Advice.attach(add, 'toolbar/worlds/add');

        // Focus
        Advice.attach(reset, 'toolbar/worlds/reset');

        // Grid
        Advice.attach(gridSnap, 'toolbar/grid/snap');

        /******************** NODES */

        const nodePlusSign = new SUEY.VectorBox(`${FOLDER_MENU}add.svg`).setID('tb-node-plus-sign');
        nodePlusSign.setColor('complement');
        add.add(nodePlusSign);

        const nodeMenu = new SUEY.Menu();
        add.attachMenu(nodeMenu);

        const addWorld2D = new SUEY.MenuItem('World 2D', `${FOLDER_MENU}node/world2d.svg`);
        const addWorld3D = new SUEY.MenuItem('World 3D', `${FOLDER_MENU}node/world3d.svg`);
        const addWorldUI = new SUEY.MenuItem('UI Screen', `${FOLDER_MENU}node/worldui.svg`);
        nodeMenu.add(addWorld2D);
        nodeMenu.add(addWorld3D);
        nodeMenu.add(addWorldUI);

        addWorld2D.divIcon.addClass('suey-black-or-white', 'suey-drop-shadow');
        addWorld3D.divIcon.addClass('suey-black-or-white', 'suey-drop-shadow');
        addWorldUI.divIcon.addClass('suey-black-or-white', 'suey-drop-shadow');

        function centerWorldPosition(world) {
            const bounds = worldsGraph.nodeBounds(0, worldsGraph.nodes.children);
            world.position.x = bounds.center().x - (200 / 2) + SUEY.GRID_SIZE;
            world.position.y = bounds.center().y - (150 / 2) + SUEY.GRID_SIZE;
        }

        function addWorld(worldType) {
            const worldName = `${worldType} ${editor.project.worldCount(worldType) + 1}`;
            let world, stage;
            switch (worldType) {
                case EDITOR_MODES.WORLD_2D: world = new SALT.World(SALT.WORLD_TYPES.WORLD_2D, worldName); break;
                case EDITOR_MODES.WORLD_3D: world = new SALT.World(SALT.WORLD_TYPES.WORLD_3D, worldName); break;
                case EDITOR_MODES.WORLD_UI: world = new SALT.World(SALT.WORLD_TYPES.WORLD_UI, worldName); break;
            }
            if (!world) return;
            switch (worldType) {
                case EDITOR_MODES.WORLD_2D: stage = new SALT.Stage(SALT.STAGE_TYPES.STAGE_2D, 'Start'); break;
                case EDITOR_MODES.WORLD_3D: stage = new SALT.Stage(SALT.STAGE_TYPES.STAGE_3D, 'Start'); break;
                case EDITOR_MODES.WORLD_UI: stage = new SALT.Stage(SALT.STAGE_TYPES.STAGE_UI, 'Start'); break;
            }
            world.addEntity(stage);
            centerWorldPosition(world);

            const cmds = [];
            cmds.push(new AddEntityCommand(world));
            cmds.push(new SetStageCommand(world.type, stage, world));
            cmds.push(new SelectCommand([ world ], editor.selected));
            editor.execute(new MultiCmdsCommand(cmds, 'Add World'));
        }

        addWorld2D.onSelect(() => addWorld(EDITOR_MODES.WORLD_2D));
        addWorld3D.onSelect(() => addWorld(EDITOR_MODES.WORLD_3D));
        addWorldUI.onSelect(() => addWorld(EDITOR_MODES.WORLD_UI));

        /******************** FOCUS */

        const resetAxisX = new SUEY.VectorBox(`${FOLDER_TOOLBAR}focus-reset-x.svg`).setID('tb-reset-axis-x');
        const resetAxisY = new SUEY.VectorBox(`${FOLDER_TOOLBAR}focus-reset-y.svg`).setID('tb-reset-axis-y');
        resetAxisX.setColor(COLORS.X_COLOR);
        resetAxisY.setColor(COLORS.Y_COLOR);
        const resetTarget = new SUEY.VectorBox(`${FOLDER_TOOLBAR}focus-target.svg`).setID('tb-reset-target');
        reset.add(resetAxisX, resetAxisY, resetTarget);

        reset.onPress(() => {
            worldsGraph.centerView(true /* resetZoom */, true /* animate */);
        });

        /******************** GRID */

        const snapMagnet = new SUEY.VectorBox(`${FOLDER_TOOLBAR}snap-magnet.svg`).setID('tb-snap-magnet');
        const snapAttract = new SUEY.VectorBox(`${FOLDER_TOOLBAR}snap-attract.svg`).setID('tb-snap-attract');
        gridSnap.add(snapMagnet, snapAttract);

        gridSnap.onPress(() => {
            const snapping = !Config.getKey('viewport/grid/snap');
            Config.setKey('viewport/grid/snap', snapping);
            worldsGraph.snapToGrid = snapping;
            Signals.dispatch('gridChanged');
        });

        Signals.connect(worldsGraph, 'gridChanged', () => {
            const snapping = Config.getKey('viewport/grid/snap');
            gridSnap.wantsClass('suey-selected', snapping);
        })

        /******************** ADD TO TOOLBAR */

        const buttons = [];
        buttons.push(new SUEY.FlexSpacer());
        buttons.push(add);
        buttons.push(new SUEY.FlexSpacer());
        buttons.push(reset);
        buttons.push(new SUEY.FlexSpacer());
        buttons.push(gridSnap);
        buttons.push(new SUEY.FlexSpacer());
        this.buttons = buttons;

    } // end ctor

}

export { WorldsToolbar };
