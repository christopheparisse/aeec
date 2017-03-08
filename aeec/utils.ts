/**
 * @module utils
 */

import * as path from 'path';
import {remote} from 'electron';
let os = require('os');
import * as bootbox from 'bootbox';

export const headLineTR = '<tr class="aeec-click" onclick="aeec.click(event)">';
export const headLine = headLineTR + '<td class="mark"><i class="fa fa-square-o"></i></td>';
export const extTeiCorpo = '.tei_corpo.xml';
export const extTrjs = '.trjs';
export const extClan = '.cha';
export const extElan = '.eaf';
export const extPraat = '.textgrid';
export const extTrs = '.trs';
export const extText = '.txt';
export const extCsv = '.csv';
export const extCex = '.cex';
export const extXml = '.xml';
export const extWordProcessor = '.docx';
export const extWorksheet = '.xlsx';

export function parsequotes(str) {
	//The parenthesis in the regex creates a captured group within the quotes
	var myRegexp = /[^\s"]+|"([^"]*)"/gi;
	var myArray = [];

	do {
		//Each call to exec returns the next regex match as an array
		var match = myRegexp.exec(str);
		if (match != null)
		{
			//Index 1 in the array is the captured group if it exists
			//Index 0 is the matched text, which we use if no captured group exists
			myArray.push(match[1] ? match[1] : match[0]);
		}
	} while (match != null);
    return myArray;
}

export function extension(fn: string) {
    if (fn.length > 14 && fn.lastIndexOf(extTeiCorpo) === fn.length - extTeiCorpo.length)
        return extTeiCorpo;
    else
        return path.extname(fn);
}

export function headname(fn: string) {
    if (fn.length > 14 && fn.lastIndexOf(extTeiCorpo) === fn.length - extTeiCorpo.length)
        return fn.substr(0,fn.length - 14);
    else {
        let ext = path.extname(fn);
        return path.basename(fn, ext);
    }
}

export function knownExt(fn) {
    let ext = extension(fn);
    switch(ext) {
        case extTeiCorpo:
        case extElan:
        case extClan:
        case extPraat:
        case extTrs:
            return true;
        default:
            return false;
    }
}

export function knownImports(fn) {
    let ext = extension(fn);
    switch(ext) {
        case extCex:
        case extWordProcessor:
        case extWorksheet:
        case extText:
        case extCsv:
            return true;
        default:
            return false;
    }
}

export let cmdsInstalled = {};

function nameOfPgm(ext: string): string {
    let pgm = '';
    switch(ext) {
        case extTeiCorpo:
            pgm = 'Trjs';
            break;
        case extElan:
            pgm = 'Elan';
            break;
        case extClan:
        case extCex:
            pgm = 'Clan';
            break;
        case extPraat:
            pgm = 'Praat';
            break;
        case extTrs:
            pgm = 'Transcriber';
            break;
        case extText:
            pgm = 'Text';
            break;
        case extXml:
            pgm = 'Xml';
            break;
        case extWordProcessor:
            pgm = 'TraitementDeTexte';
            break;
        case extWorksheet:
            pgm = 'Tableur';
            break;
        default:
            pgm = 'Application' + ext.replace(/\./g,'_');
            break;
    }
    return pgm;
}

function findPgm(ext: string): string {
    let pgm = nameOfPgm(ext);
    remote.dialog.showMessageBox({
        type: 'info',
        message: "L'emplacement du logiciel " + pgm +  ' doit être déterminé. Veuillez le localiser sur votre machine.',
    });
    
    let filters;
    if (os.platform() === 'win32') {
        filters = [{ name: 'Exe Files', extensions: ['exe'] }];
    } else {
        filters = [{ name: 'All Files', extensions: ['*'] }];
    }
    let fl = remote.dialog.showOpenDialog({
        title: 'Choose file',
        filters: filters,
        properties: [ 'openFile' ]
    });
    if (fl) {
        if (os.platform() === 'darwin') {
            // the .app is not enough
            console.log('darwin:', pgm, fl[0]);
            fl[0] = path.basename(fl[0]);
        }
        localStorage.setItem('cmd' + pgm, fl[0]);
        return fl[0];
    } else {
        return '';
    }
}

export function installCmd(cmd: string, force: boolean): string {
    if (force !== true) {
        let previousPgm = localStorage.getItem('cmd' + nameOfPgm(cmd));
        if (previousPgm) {
            return previousPgm;
        }
    }
    let pgm = findPgm(cmd);
    if (pgm) {
        return pgm;
    }
    return null;
}

export function clearClan() {
    localStorage.setItem('cmd' + nameOfPgm(extClan), '');
}

export function clearElan() {
    localStorage.setItem('cmd' + nameOfPgm(extElan), '');
}

export function clearPraat() {
    localStorage.setItem('cmd' + nameOfPgm(extPraat), '');
}

export function clearTrs() {
    localStorage.setItem('cmd' + nameOfPgm(extTrs), '');
}

export function clearTrjs() {
    localStorage.setItem('cmd' + nameOfPgm(extTeiCorpo), '');
}

export function changeProgAssoc() {
    bootbox.alert({
        title: 'Réinitialiser l\'emplacement d\'un programme',
//        size: 'large',
        message: `
            <div>
                <div class="row">
                    <div class="col-md-6"><button type="button" id="reinitclan" class="btn btn-default" onclick="aeec.utils.clearClan(event);">
                    <span id='preinitclan'>Réinitialiser l'emplacement de CLAN </span></button></div>
                    <div class="col-md-6"><button type="button" id="reinitelan" class="btn btn-default" onclick="aeec.utils.clearElan(event);">
                    <span id='preinitclan'>Réinitialiser l'emplacement de ELAN</span></button></div>
                    <div class="col-md-6"><button type="button" id="reinitpraat" class="btn btn-default" onclick="aeec.utils.clearPraat(event);">
                    <span id='preinitclan'>Réinitialiser l'emplacement de PRAAT</span></button></div>
                    <div class="col-md-6"><button type="button" id="reinittrs" class="btn btn-default" onclick="aeec.utils.clearTrs(event);">
                    <span id='preinitclan'>Réinitialiser l'emplacement de Transcriber</span></button></div>
                    <div class="col-md-6"><button type=button" id="reinittrjs" class="btn btn-default" onclick="aeec.utils.clearTrjs(event);">
                    <span id='preinitclan'>Réinitialiser l'emplacement de TRJS</span></button></div>
                </div>
            </div>
`,
/*
        buttons: {
            confirm: {
                label: '<i class="fa fa-check"></i>Ok.'
            }
        },
        callback: () => {},
*/
    });
}