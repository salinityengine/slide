import * as SUEY from 'suey';
import { SmartShrinker } from './SmartShrinker.js';

class PropertyGroup extends SmartShrinker {

    constructor({
        title,
        icon,
        arrow = 'left',
        border = false,
        shrink = false,
        radius = 0,
        defaultExpanded = false,
        leftPropertyWidth = '50%',
    } = {}) {
        super({ title, icon, arrow, border, shrink, radius, defaultExpanded });

        // Property List
        const properties = new SUEY.PropertyList(leftPropertyWidth);
        this.add(properties);
        this.properties = properties;

        // Contents Accessor (this.add(...rows))
        this.contents = function() { return properties };
    }

    setLeftPropertyWidth(width = '50%') {
        return this.properties.setLeftPropertyWidth(width);
    }

    addHeader(text = '', iconUrl, arrow = 'left') {
        return this.properties.addHeader(text, iconUrl, arrow);
    }

    addRow(title = '', ...controls) {
        return this.properties.addRow(title, ...controls);
    }

    addRowWithoutTitle(...controls) {
        return this.properties.addRowWithoutTitle(...controls);
    }

    createHeader(text = '', iconUrl, arrow = 'left') {
        return this.properties.createHeader(text, iconUrl, arrow);
    }

    createRow(title = '', ...controls) {
        return this.properties.createRow(title, ...controls);
    }

    createRowWithoutTitle(...controls) {
        return this.properties.createRowWithoutTitle(...controls);
    }

    /** Creates a zero margin Row to hold right side controls of a Property Row */
    createControls(/* any number of Osui Elements */) {
        return this.properties.createControls(...arguments);
    }

    disableInputs(disable = true) {
        return this.properties.disableInputs(disable);
    }

}

export { PropertyGroup };
