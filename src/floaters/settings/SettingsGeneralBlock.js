import * as EDITOR from 'editor';
import * as SALT from 'engine';
import * as SUEY from 'gui';
import { editor } from 'editor';

import { Advice } from '../../config/Advice.js';
import { Config } from '../../config/Config.js';
import { Language } from '../../config/Language.js';
import { Signals } from '../../config/Signals.js';

const _color = new SUEY.Iris();

class SettingsGeneralBlock extends SUEY.Shrinkable {

    constructor() {
        const icon = `${EDITOR.FOLDER_FLOATERS}settings/general.svg`; // color: '#C04145'
        super({ text: Language.getKey('inspector/settings/general'), icon, arrow: 'right', border: true });
        Advice.attach(this.titleDiv, 'settings');

        // Property Box
        const props = new SUEY.PropertyList();
        this.add(props);

        /***** GENERAL *****/

        // Language
        const languageOptions = {
            en: 'English',
            fr: 'Français',
            zh: '中文',
        };
        const languageDropDown = new SUEY.Dropdown();
        languageDropDown.overflowMenu = SUEY.OVERFLOW.LEFT;
        languageDropDown.setOptions(languageOptions);
        languageDropDown.on('change', () => {
            Config.setKey('settings/language', languageDropDown.getValue());
            editor.refreshSettings();
        });
        const languageRow = props.addRow(Language.getKey('inspector/settings/language'), languageDropDown);
        Advice.attach(languageRow, 'settings/general/language');

        // ProMode
        //              List of Changes Below
        //
        //      - Show UUID of Objects in the Inspector
        //      - More options in the Material / Geometry components
        //      - THREE Tab (fps, renderer info)
        //      - Extra 'Settings' options
        //
        //
        const promodeBox = new SUEY.Checkbox().on('change', () => {
            Config.setKey('promode', (!Config.getKey('promode')));
            Signals.dispatch('promodeChanged');
        });
        const promodeRow = props.addRow('Pro Mode', promodeBox);
        Advice.attach(promodeRow, 'settings/general/promode');

        // Reset All Settings
        const resetButton = new SUEY.Button().addClass('suey-property-button').onClick(() => {
            if (confirm('Reset all editor settings to default values?')) {
                Config.clear();
                editor.refreshSettings();
            }
        });
        const resetLabel = Language.getKey('inspector/settings/reset');
        const resetShortcut = Config.getKey('shortcuts/reset');
        resetButton.add(new SUEY.ShadowBox(`${EDITOR.FOLDER_FLOATERS}settings/general/reset.svg`));
        resetButton.setAttribute('tooltip', Config.tooltip(resetLabel, resetShortcut));
        const resetRow = props.addRow(resetLabel, resetButton);
        Advice.attach(resetRow, 'settings/reset');

        /***** STYLE *****/

        const styleHeader = props.addHeader(Language.getKey('inspector/settings/style'), `${EDITOR.FOLDER_FLOATERS}settings/general/style.svg`);
        Advice.attach(styleHeader, 'settings/style');

        // THEME //

        const themeButton = new SUEY.Button().addClass('suey-dropdown', 'suey-drop-arrow');
        themeButton.overflowMenu = SUEY.OVERFLOW.LEFT;
        themeButton.menuOffsetY = 3;
        const themeBackground = new SUEY.Div().addClass('suey-drop-color');
        themeButton.add(themeBackground);

        // Theme Menu
        const themeMenu = new SUEY.Menu();
        const schemeDark = new SUEY.MenuItem('Dark', `${EDITOR.FOLDER_FLOATERS}settings/general/style/dark.svg`).keepOpen();
        const schemeMid = new SUEY.MenuItem('Mid', `${EDITOR.FOLDER_FLOATERS}settings/general/style/mid.svg`).keepOpen();
        const schemeLight = new SUEY.MenuItem('Light', `${EDITOR.FOLDER_FLOATERS}settings/general/style/light.svg`).keepOpen();
        themeMenu.add(schemeDark, schemeMid, schemeLight);

        // Theme Events
        function setTheme(theme) {
            editor.setSchemeBackground(theme);
            updateUI();
        }
        schemeDark.onSelect(() => setTheme(SUEY.BACKGROUNDS.DARK));
        schemeMid.onSelect(() => setTheme(SUEY.BACKGROUNDS.MID));
        schemeLight.onSelect(() => setTheme(SUEY.BACKGROUNDS.LIGHT));

        // Add Theme Menu, Button
        themeButton.attachMenu(themeMenu, true /* popupStyle */);
        const themeRow = props.addRow('Theme', themeButton);
        Advice.attach(themeRow, 'settings/style/theme');

        // COLOR //

        const colorButton = new SUEY.Button().addClass('suey-dropdown', 'suey-drop-arrow');
        colorButton.overflowMenu = SUEY.OVERFLOW.LEFT;
        colorButton.menuOffsetY = 4;
        const colorBackground = new SUEY.Div().addClass('suey-drop-color');
        colorButton.add(colorBackground);

        // Color Menu
        const colorMenu = new SUEY.Menu();
        const schemeClassic = new SUEY.MenuItem('Classic', `${EDITOR.FOLDER_FLOATERS}settings/general/style/classic.svg`).keepOpen();
        const schemeSteel = new SUEY.MenuItem('Steel', `${EDITOR.FOLDER_FLOATERS}settings/general/style/light.svg`).keepOpen();
        const schemeNavy = new SUEY.MenuItem('Navy', `${EDITOR.FOLDER_FLOATERS}settings/general/style/navy.svg`).keepOpen();
        const schemeGrape = new SUEY.MenuItem('Grape', `${EDITOR.FOLDER_FLOATERS}settings/general/style/grape.svg`).keepOpen();
        const schemeFlamingo = new SUEY.MenuItem('Flamingo', `${EDITOR.FOLDER_FLOATERS}settings/general/style/flamingo.svg`).keepOpen();
        const schemeRust = new SUEY.MenuItem('Rust', `${EDITOR.FOLDER_FLOATERS}settings/general/style/rust.svg`).keepOpen();
        const schemeCarrot = new SUEY.MenuItem('Carrot', `${EDITOR.FOLDER_FLOATERS}settings/general/style/carrot.svg`).keepOpen();
        const schemeCoffee = new SUEY.MenuItem('Coffee', `${EDITOR.FOLDER_FLOATERS}settings/general/style/coffee.svg`).keepOpen();
        const schemeGolden = new SUEY.MenuItem('Golden', `${EDITOR.FOLDER_FLOATERS}settings/general/style/golden.svg`).keepOpen();
        const schemeEmerald = new SUEY.MenuItem('Emerald', `${EDITOR.FOLDER_FLOATERS}settings/general/style/emerald.svg`).keepOpen();
        const schemeRandom = new SUEY.MenuItem('Random', `${EDITOR.FOLDER_FLOATERS}settings/general/style/random.svg`).keepOpen();
        colorMenu.add(schemeClassic, schemeSteel, schemeNavy, schemeGrape, schemeFlamingo, schemeRust,
            schemeCarrot, schemeCoffee, schemeGolden, schemeEmerald, schemeRandom);

        // Color Events
        function setColor(color, tint, saturation) {
            editor.setSchemeColor(color, tint, saturation);
            updateUI();
        }
        schemeClassic.onSelect(() => setColor(SUEY.THEMES.CLASSIC, 0.00));
        schemeSteel.onSelect(() => setColor(SUEY.THEMES.STEEL, 0.10, -1.0));
        schemeFlamingo.onSelect(() => setColor(SUEY.THEMES.FLAMINGO, 0.10));
        schemeNavy.onSelect(() => setColor(SUEY.THEMES.NAVY, 0.20));
        schemeGrape.onSelect(() => setColor(SUEY.THEMES.GRAPE, 0.15));
        schemeRust.onSelect(() => setColor(SUEY.THEMES.RUST, 0.20));
        schemeCarrot.onSelect(() => setColor(SUEY.THEMES.CARROT, 0.20));
        schemeCoffee.onSelect(() => setColor(SUEY.THEMES.COFFEE, 0.20));
        schemeGolden.onSelect(() => setColor(SUEY.THEMES.GOLDEN, 0.15));
        schemeEmerald.onSelect(() => setColor(SUEY.THEMES.EMERALD, 0.10));
        schemeRandom.onSelect(() => setColor(SUEY.Iris.randomHex(), 0.10));

        // Add Color Menu and Button
        colorButton.attachMenu(colorMenu, true /* popupStyle */);
        const colorRow = props.addRow('Color', colorButton);
        Advice.attach(colorRow, 'settings/style/color');

        // TEXT SIZE //

        // Smaller
        const smallerButton = new SUEY.Button().addClass('suey-property-button-flex').onClick(() => {
            editor.fontSizeChange('down');
        });
        const smallerLabel = 'Smaller'
        const smallerShortcut = '-';
        const smallLetter = new SUEY.VectorBox(`${EDITOR.FOLDER_FLOATERS}settings/general/style/smaller.svg`);
        smallLetter.firstImage().addClass('suey-icon-colorize');
        smallerButton.add(new SUEY.ShadowBox(smallLetter));
        const smallShortcutText = new SUEY.Div(smallerShortcut).setClass('suey-menu-shortcut');
        smallShortcutText.setStyle('display', 'block', 'textAlign', 'right', 'paddingLeft', '0', 'paddingRight', '0.55em');
        smallerButton.add(smallShortcutText);
        smallerButton.setAttribute('tooltip', Config.tooltip(smallerLabel, smallerShortcut));

        // Larger
        const largerButton = new SUEY.Button().addClass('suey-property-button-flex').onClick(() => {
            editor.fontSizeChange('up');
        });
        const largerLabel = 'Larger'
        const largerShortcut = '+';
        const largeLetter = new SUEY.VectorBox(`${EDITOR.FOLDER_FLOATERS}settings/general/style/larger.svg`);
        largeLetter.firstImage().addClass('suey-icon-colorize');
        largerButton.add(new SUEY.ShadowBox(largeLetter));
        const largeShortcutText = new SUEY.Div(largerShortcut).setClass('suey-menu-shortcut');
        largeShortcutText.setStyle('display', 'block', 'textAlign', 'right', 'paddingLeft', '0', 'paddingRight', '0.55em');
        largerButton.add(largeShortcutText);
        largerButton.setAttribute('tooltip', Config.tooltip(largerLabel, largerShortcut));

        // Font Button Row
        const textSizeRow = props.addRow('Text Size', smallerButton, largerButton);
        Advice.attach(textSizeRow, 'settings/style/textsize');

        // OPACITY //

        const alphaSlider = new SUEY.Slider();
        alphaSlider.on('input', () => {
            const panelAlpha = SALT.Maths.clamp(parseFloat(alphaSlider.getValue()), 0.0, 1.0);
            Config.setKey('scheme/panelTransparency', panelAlpha);
            SUEY.Css.setVariable('--panel-transparency', panelAlpha);
        });
        alphaSlider.setRange(0, 1.0).setStep('any').setPrecision(2);
        const opacityRow = props.addRow('Opacity', alphaSlider);
        Advice.attach(opacityRow, 'settings/style/opacity');

        /***** UPDATE *****/

        function updateUI() {
            languageDropDown.setValue(Config.getKey('settings/language'));
            promodeBox.setValue(Config.getKey('promode'));

            themeBackground.setStyle('backgroundColor', 'rgb(var(--background-dark))');
            switch (parseInt(Config.getKey('scheme/background'))) {
                case SUEY.BACKGROUNDS.DARK:  themeButton.setAttribute('tooltip', 'Dark'); break;
                case SUEY.BACKGROUNDS.MID:   themeButton.setAttribute('tooltip', 'Mid'); break;
                case SUEY.BACKGROUNDS.LIGHT: themeButton.setAttribute('tooltip', 'Light'); break;
            }

            let color = parseInt(Config.getKey('scheme/iconColor'));
            let saturation = parseFloat(Config.getKey('scheme/backgroundSaturation'));
            let hexColor = _color.set(color).hslOffset(0, saturation, 0).hexString();
            colorBackground.setStyle('backgroundColor', hexColor);
            colorButton.setAttribute('tooltip', hexColor); // _color.cssString());

            let panelAlpha = Config.getKey('scheme/panelTransparency');
            if (panelAlpha === undefined || panelAlpha === null) {
                panelAlpha = 1.0;
                Config.setKey('scheme/panelTransparency', panelAlpha);
            }
            alphaSlider.setValue(panelAlpha);
        }

        /***** SIGNALS *****/

        Signals.connect(this, 'schemeChanged', updateUI);

        /***** INIT *****/

        updateUI();

    } // end ctor

}

export { SettingsGeneralBlock };