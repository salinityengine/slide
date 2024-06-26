import * as SUEY from 'suey';
import { Signals } from './Signals.js';

class Commands extends SUEY.Div {

    constructor() {
        super();

        // Properties
        this.undos = [];
        this.redos = [];
        this.lastCmdTime = new Date();
    }

    /** Executes new command onto stack, clears old redo history */
    execute(cmd) {
        if (cmd.valid !== true) return cmd.purge();

        const lastCmd = this.undos[this.undos.length - 1];
        const timeDifference = new Date().getTime() - this.lastCmdTime.getTime();

        const isUpdatableCmd = lastCmd && lastCmd.updatable && cmd.updatable &&
            lastCmd.asset === cmd.asset &&
            lastCmd.component === cmd.component &&
            lastCmd.componentType === cmd.componentType &&
            lastCmd.componentIndex === cmd.componentIndex &&
            lastCmd.entity === cmd.entity &&
            lastCmd.type === cmd.type &&
            lastCmd.script === cmd.script &&
            lastCmd.attributeName === cmd.attributeName;

        let updateOnly = false;
        if (isUpdatableCmd) {
            updateOnly = (timeDifference < 1000) // one second
            || (cmd.attributeName === 'name')
            || (cmd.type === 'SetAssetValueCommand' && cmd.attributeName === 'source')
            || (cmd.type === 'ChangeComponentCommand');
        }

        // Update Command
        if (updateOnly) {
            lastCmd.update(cmd);
            cmd = lastCmd;

        // Command is not updatable, add to undo history
        } else {
            this.undos.push(cmd);
            cmd.id = this.undos.length;
        }

        cmd.execute();
        cmd.inMemory = true;

        // Save last time this command was executed
        this.lastCmdTime = new Date();

        // Clearing all the redo-commands
        this.clearRedos();

        // Signal
        Signals.dispatch('historyChanged');
    }

    undo() {
        let cmd = undefined;
        if (this.undos.length > 0) {
            cmd = this.undos.pop();
        }
        if (cmd != undefined) {
            cmd.undo();
            this.redos.push(cmd);
            Signals.dispatch('historyChanged');
        }
        return cmd;
    }

    redo() {
        let cmd = undefined;
        if (this.redos.length > 0) {
            cmd = this.redos.pop();
        }
        if (cmd != undefined) {
            cmd.redo(); /* base class Command.redo() simply calls Command.execute(), can be overridden */
            this.undos.push(cmd);
            Signals.dispatch('historyChanged');
        }
        return cmd;
    }

    goToState(id) {
        // Disable Signals
        Signals.disable();

        // Run through Stack
        let cmd = this.undos.length > 0 ? this.undos[this.undos.length - 1] : undefined;
        if (cmd == undefined || id > cmd.id) {
            cmd = this.redo();
            while (cmd !== undefined && id > cmd.id) {
                cmd = this.redo();
            }
        } else {
            while (true) {
                cmd = this.undos[this.undos.length - 1];
                if (cmd === undefined || id === cmd.id) break;
                this.undo();
            }
        }
        Signals.dispatch('historyChanged');

        // Enable Signals
        Signals.enable();
    }

    clear() {
        this.clearUndos();
        this.clearRedos();
        Signals.dispatch('historyChanged');
    };

    clearUndos() {
        for (const undo of this.undos) undo.purge();
        this.undos = [];
    }

    clearRedos() {
        for (const redo of this.redos) redo.purge();
        this.redos = [];
    }

}

export { Commands };
