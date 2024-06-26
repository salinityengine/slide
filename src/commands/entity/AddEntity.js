import editor from 'editor';
import { Command } from '../Command.js';
import { Signals } from '../../config/Signals.js';

class AddEntityCommand extends Command {

    constructor(entity, parent, index = -1) {
        super();

        // Cancel?
        if (!entity) return this.cancel(`AddEntityCommand: No entity provided`);
        if (!parent && !entity.isWorld) return this.cancel(`AddEntityCommand: No parent provided`);

        // Properties
        this.entity = entity;
        this.parent = parent;
        this.index = (index === undefined || index === null) ? -1 : index;
        this.project = editor.project;
        this.wasAdded = false;

        // Brief
        this.brief = `Add Entity: "${entity.name}"`;
    }

    purge() {
        if (!this.wasAdded && this.entity && typeof this.entity.dispose === 'function') {
            this.entity.dispose();
        }
    }

    execute() {
        if (this.entity.isWorld) {
            this.project.addWorld(this.entity);
        } else {
            this.parent.addEntity(this.entity, this.index);
            Signals.dispatch('entityChanged', this.entity);
            Signals.dispatch('entityChanged', this.parent);
        }

        Signals.dispatch('sceneGraphChanged');
        this.wasAdded = true;
    }

    undo() {
        if (this.entity.isWorld) {
            this.project.removeWorld(this.entity);
        } else {
            this.parent.removeEntity(this.entity);
            Signals.dispatch('entityChanged', this.entity);
            Signals.dispatch('entityChanged', this.parent);
        }

        Signals.dispatch('sceneGraphChanged');
        this.wasAdded = false;
    }

}

export { AddEntityCommand };
