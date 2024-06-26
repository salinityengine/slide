// https://github.com/mrdoob/three.js/blob/master/editor/js/Loader.js

import editor from 'editor';
import * as SALT from 'salt';
import * as SUEY from 'suey';

import { Signals } from './Signals.js';

import { AddAssetCommand } from '../commands/CommandList.js';

import { unzipSync, strFromU8 } from '../../libs/fflate.module.js';

class Loader {

    static loadFiles(files) {
        if (!files) return;
        for (const file of files) {
            Loader.loadFile(file);
        }
    }

    static loadFile(file) {
        let filename = file.name;
        let extension = filename.split('.').pop().toLowerCase();
        if (file.type && file.type === 'image/png') extension = 'image';

        const reader = new FileReader();
        reader.addEventListener('progress', function(event) {
            const size = '(' + SALT.MathUtils.addCommas(Math.floor(event.total / 1000)) + ' KB)';
            const progress = Math.floor((event.loaded / event.total) * 100) + '%';
            console.info('Loading', filename, size, progress);
        });

        switch (extension) {
            /******************** JSON */
            case 'eye':
            case 'js':
            case 'json':
                reader.addEventListener('load', function(event) {
                    const contents = event.target.result;
                    let data;
                    try {
                        data = JSON.parse(contents);
                    } catch (error) {
                        alert(error);
                        return;
                    }
                    handleJSON(data);
                }, false);

                reader.readAsText(file);
                break;

            /******************** IMAGE */
            case 'image':
            case 'bmp':
            case 'gif':
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'webp':
                reader.addEventListener('load', async function(event) {
                    const contents = event.target.result;
                    SALT.AssetManager.loadTexture(contents, (texture) => {
                        texture.name = SUEY.Strings.nameFromUrl(file.name);
                        editor.execute(new AddAssetCommand(texture));
                    });
                });
                reader.readAsDataURL(file);
                break;

            /******************** OBJECT */
            case 'svg':
                //
                // TODO: Load svg
                //
                break;

            /******************** ARCHIVE */
            case 'zip':
                reader.addEventListener('load', function(event) {
                    handleZIP(event.target.result);
                }, false);
                reader.readAsArrayBuffer(file);
                break;

            default:
                console.error(`Loader.loadFile(): Unsupported file format '${extension}'`);
                break;
        }
    }

}

export { Loader };

/******************** INTERNAL ********************/

function handleJSON(data) {
    // DEBUG: Show internal file type
    console.info(`Type: ${data.meta.type}`);

    switch (data.meta.type.toLowerCase()) {
        case 'entity':
        case 'geometry':
        case 'palette':
        case 'texture':
            //
            // TODO: Object Types
            //
            break;

        // Published from Salinity Editor
        case 'salinity':
            editor.loadProject(data);
            break;

        default:
            console.warn(`Loader.handleJSON(): File type unknown '${data.metadata.type.toLowerCase()}'`);
    }
}

async function handleZIP(contents) {
    const zip = unzipSync(new Uint8Array(contents));
    for (const path in zip) {
        const file = zip[path];

        /***** UNZIPPED *****/

        const extension = path.split('.').pop().toLowerCase();
        switch (extension) {
            case 'fbx':
            case 'gltf':
                //
                // TODO: Zipped files
                //
                break;
        }
    }
}
