/* use strict */

import * as fs from 'fs';

// let dialog = require('electron').dialog;
import {remote} from 'electron';

export const extMedia = ['wav', 'mp3', 'mp4', 'mpeg', 'mpg', 'avi', 'ogg', 'ogv', 'oga', 'webm', 'mov', 'mkv', 'divx', 'm4v'];
export const extTranscription = ['trjs', 'trs', 'xml', 'eaf', 'textgrid', 'cha', 'cex', 'txt'];
/**
 * available in main
 */
export function chooseOpenFile(extension: string, callback: (error: number, data: any) => void) {
    try {
        let filters = [];
        if (extension.indexOf('aeec') >= 0) {
            filters.push({ name: 'Corpus Files', extensions: ['aeec', 'csv', 'txt'] });
        }
        if (extension.indexOf('json') >= 0) {
            filters.push({ name: 'Json Files', extensions: ['json'] });
        }
        if (extension.indexOf('csv') >= 0) {
            filters.push({ name: 'Csv Files', extensions: ['csv', 'txt'] });
        }
        if (extension.indexOf('trjs') >= 0) {
            filters.push({ name: 'Transcription Files', extensions: extTranscription });
        }
        if (extension.indexOf('txt') >= 0) {
            filters.push({ name: 'Text Files', extensions: ['txt'] });
        }
        if (extension.indexOf('media') >= 0) {
            filters.push({ name: 'Media Files', extensions: extMedia });
        }
        if (extension.indexOf('all') >= 0) {
            filters.push({ name: 'All Files', extensions: ['*'] });
        }
        let fl = remote.dialog.showOpenDialog({
            title: 'Choose file',
            filters: filters,
            properties: [ 'openFile', 'multiSelections' ]
        });
        if (fl) {
//            systemCall.openFile(fl[0], callback);
//            table = Papa.parse(data, { delimiter: "\t" });
            callback(0, fl);
        } else {
            callback(1, 'cancelled');
        }
    } catch (error) {
        console.log(error);
        callback(1, error);
    }
};

/**
 * available in main
 */
export function chooseOpenDir(callback: (error: number, data: any) => void) {
    try {
        let fl = remote.dialog.showOpenDialog({
            title: 'Choose repertory',
//            filters: [ { name: 'All Files', extensions: ['*'] }],
            properties: [ 'openDirectory', 'multiSelections' ]
        });
        if (fl) {
//            systemCall.openFile(fl[0], callback);
//            table = Papa.parse(data, { delimiter: "\t" });
            callback(0, fl);
        } else {
            callback(1, 'cancelled');
        }
    } catch (error) {
        console.log(error);
        callback(1, error);
    }
};

export function chooseSaveFile(extension: string, callback: (error: number, data: any) => void) {
    let filter;
    if (extension === 'json')
        filter = [
                { name: 'Json Files', extensions: ['json'] },
        ];
    else if (extension === 'csv')
        filter = [
                { name: 'Csv Files', extensions: ['csv', 'txt'] },
        ];
    else
        filter = [
                { name: 'All Files', extensions: ['*'] },
        ];
    try {
        let fl = remote.dialog.showSaveDialog({
            title: 'Save corpus file',
            filters: filter,
        });
        if (fl) {
            callback(0, fl);
        } else
            callback(1, 'cancelled');
    } catch (error) {
        console.log(error);
        callback(1, error);
    }
};

/**
 * available in renderer and main
 */
export function readFile(fname: string, callback: (error: number, fn: string, data: any) => void) {
    try {
        let tb = fs.readFileSync(fname, 'utf-8');
        callback(0, fname, tb);
    } catch (error) {
        console.log(error);
        callback(1, error, null);
    }
};

export function writeFile(fname: string, data: any, callback: (error: number, data: any) => void) {
    try {
        fs.writeFileSync(fname, data, 'utf-8');
        if (callback) callback(0, 'file saved');
    } catch (error) {
        console.log(error);
        if (callback) callback(1, error);
    }
};

/*
export readFile = function(fname, callbackDone, callbackFail) {
    //console.log('LOADFILE: ' + fname);
    try {
        fs.readFile(fname, 'utf-8', function (err, data) {
            if (!err)
                callbackDone(data);
            else
                callbackFail(err + ' ' + data);
        });
    } catch (error) {
        console.log(error);
        callbackFail(error);
    }
};
*/

export function readBinaryFileSync(fname) {
    //console.log('READ BINARY FILE: ' + fname);
    try {
        let data = fs.readFileSync(fname);
    } catch (error) {
        console.log(error);
        return '';
    }
};
