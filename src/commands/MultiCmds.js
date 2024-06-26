import * as SALT from 'salt';
import { Command } from './Command.js';
import { Signals } from '../config/Signals.js';

class MultiCmdsCommand extends Command {

    constructor(commands = [], brief = undefined, onExecute, onUndo) {
        super();
        this.type = 'MultiCmdsCommand';
        this.brief = brief ?? 'Multiple Changes';

        // Check cmds are 'valid'
        const cmds = [];
        for (const command of commands) {
            if (command.type === 'SelectCommand') command.valid = true; /* all 'Select' commands valid in MultiCmdsCommand */
            if (command.valid) {
                cmds.push(command);
            } else {
                command.purge(); /* clean up */
            }
        }

        // Callbacks
        this.onExecute = onExecute;
        this.onUndo = onUndo;

        // Cancel?
        if (cmds.length === 0) {
            return this.cancel();
        // If only one command, return that command instead
        } else if (cmds.length === 1 && !onExecute && !onUndo) {
            return cmds[0];
        // Use MultiCmds
        } else {
            this.commands = cmds;
        }
    }

    purge() {
        for (const command of this.commands) command.purge();
    }

    execute() {
        this.process('execute');
        if (typeof this.onExecute === 'function') this.onExecute();
    }

    undo() {
        this.process('undo');
        if (typeof this.onUndo === 'function') this.onUndo();
    }

    process(type = 'execute') {
        // Disable Change Signals
        Signals.toggle('entityChanged', false);
        Signals.toggle('transformsChanged', false);
        Signals.toggle('sceneGraphChanged', false);
        Signals.toggle('selectionChanged', false);

        // Changed Entity Lists
        const commandTypes = {};
        const entitiesChanged = [];
        const transformsChanged = [];
        let hasSelection = false;

        function addToChangedArray(changedArray, entity) {
            if (!entity || !entity.isEntity || !Array.isArray(changedArray)) return;
            if (SALT.ArrayUtils.includesThing(entity, changedArray) === false) changedArray.push(entity);
        }

        // Execute Commands
        for (let i = 0; i < this.commands.length; i++) {
            // Forwards, or backwards?
            const index = (type === 'execute') ? i : (this.commands.length - 1) - i;
            const command = this.commands[index];

            // Get Type
            if (commandTypes[command.type] === undefined) commandTypes[command.type] = command.type;

            // Perform Command Action
            if (type === 'execute') command.execute();
            if (type === 'undo') command.undo();

            // Collect list of entities that have been changed
            switch (command.type) {
                case 'SetPositionCommand':
                case 'SetRotationCommand':
                case 'SetScaleCommand':
                    addToChangedArray(transformsChanged, command.entity);
                    break;
                case 'AddEntityCommand':
                case 'RemoveEntityCommand':
                    addToChangedArray(entitiesChanged, command.entity);
                    addToChangedArray(entitiesChanged, command.parent);
                    break;
                case 'MoveEntityCommand':
                    addToChangedArray(entitiesChanged, command.entity);
                    addToChangedArray(entitiesChanged, command.oldParent);
                    addToChangedArray(entitiesChanged, command.newParent);
                    break;
                case 'SetCopyCommand':
                case 'SetUUIDCommand':
                case 'SetEntityValueCommand':
                    addToChangedArray(entitiesChanged, command.entity);
                    break;
                case 'SelectCommand':
                    hasSelection = true;
                    break;
            }
        }

        // Entity Changed Signal
        Signals.toggle('entityChanged', true);
        for (const entity of entitiesChanged) {
            Signals.dispatch('entityChanged', entity);
        }

        // Transforms Changed Signal
        Signals.toggle('transformsChanged', true);
        Signals.dispatch('transformsChanged', transformsChanged);

        // Scene Graph Signal
        Signals.toggle('sceneGraphChanged', true);
        Signals.dispatch('sceneGraphChanged');

        // Selection Changed?
        Signals.toggle('selectionChanged', true);
        if (hasSelection) Signals.dispatch('selectionChanged');

        // // DEBUG: Show command types in this MultiCmd
        // console.group(`MultiCmdsCommand Execute, Qty: ${this.commands.length}`);
        // for (const cmdType in commandTypes) console.log(`Command Type: ${commandTypes[cmdType]}`);
        // console.groupEnd();
        // //
    }

}

export { MultiCmdsCommand };
