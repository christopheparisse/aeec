/**
 * params.ts
 * structure to store parameters to execute commands
 * the same structure is used for all commands
 */

import * as systemCall from '../systemcall/opensave';
import * as utils from './utils';

export class Params {
    action: string; // type of command currently requested
    cvtCommand: string; // convert command
    cvtLevel: number;  // level deepth (1 main line, 2 secondary lines, etc.)
    cvtKeep: any;      // array of tiers to keep
    cvtNotkeep: any;      // array of tiers to suppress
    cvtNormalize: string;  // source coding
    cvtTarget: string;     // destination coding
    cvtRawLine: boolean;    // produced text without markers
    cvtPraatOptions: boolean; // define praat options or not
    cvtDest: string;    // convert optional destination
    // EXPORTS
    exportCommand: string; // export command
    exportTV: any;            // set of couples type/value for export
    exportSection: boolean;   // includes section values in export
    exportKeep: any;      // array of tiers to keep
    exportNotkeep: any;      // array of tiers to suppress
    exportNormalize: string;  // source coding
    exportRawLine: boolean;    // produced text without markers
    exportDest: string; // export destination
    // QUERIES
    searchCommand: string; // query command to be performed
    searchStr: string;    // pattern to look for
    searchKeep: string; // tiers to search
    searchKwicWidth: number;  // with of KWIC
    searchIgnorecase: boolean; // ignorecase in queries
    searchAll: boolean;   // look for all tier
}

function init(p) {
    p.action = 'convert';
    p.cvtCommand = 'TEI';
    p.searchCommand = 'KWIC';
    p.exportCommand = 'TXM';
    p.exportRawLine = true;
    p.exportTV = {};
}

export function exportTVSet(p, type, val) {
    for (let i in p.exportTV) {
        if (type === i) {
            p.exportTV[i] = val;
            return;
        }
    }
    p.exportTV[type] = val;
}

export function exportTVReset(p) {
    p.exportTV = {};
}

export function exportTVDelete(p, type) {
    p.exportTV[type] = undefined;
}

export function exportTVString(p): string {
    let s = '';
    for (let i in p.exportTV) {
        if (!p.exportTV[i]) continue;
        s += i + '=' + p.exportTV[i] + '\n';
    }
    return s;
}

export function exportTVHTML(p): string {
    let s = '<ul>';
    for (let i in p.exportTV) {
        if (!p.exportTV[i]) continue;
        s += '<li><span class="tv-type">' + i + '</span>=<span class="tv-val">' + p.exportTV[i] + '</span></li>';
    }
    return s + '</ul>';
}

export function toString(p): string {
    let s: string = "";
    s += "action: " + p.action + "\n";
    s += "cvt Command: " + p.cvtCommand + "\n";
    s += "cvt level: " + p.cvtLevel + "\n";
    s += "cvt keep: " + p.cvtKeep + "\n";
    s += "cvt notkeep: " + p.cvtNotkeep + "\n";
    s += "cvt normalize: " + p.cvtNormalize + "\n";
    s += "cvt target: " + p.cvtTarget + "\n";
    s += "cvt rawLine: " + p.cvtRawLine + "\n";
    s += "cvt praatOptions: " + p.cvtPraatOptions + "\n";
    s += "cvt dest: " + p.cvtDest + "\n";
    s += "export Command: " + p.exportCommand + "\n";
    s += "export tv: " + p.exportTVString() + "\n";
    s += "export section: " + p.exportSection + "\n";
    s += "export keep: " + p.exportKeep + "\n";
    s += "export notkeep: " + p.exportNotkeep + "\n";
    s += "export normalize: " + p.exportNormalize + "\n";
    s += "export rawLine: " + p.exportRawLine + "\n";
    s += "export dest: " + p.exportDest + "\n";
    s += "search Command: " + p.searchCommand + "\n";
    s += "search str: " + p.searchStr + "\n";
    s += "search keep: " + p.searchKeep + "\n";
    s += "search kwicWidth: " + p.searchKwicWidth + "\n";
    s += "search ignorecase: " + p.searchIgnorecase + "\n";
    s += "search all: " + p.searchAll + "\n";
    return s;
}

export let current = new Params();
init(current);

export function loadSavedParameters(): any {
    let saved = localStorage.getItem('paramsAEEC');
    if (saved) saved = JSON.parse(saved);
    return saved;
}

export function loadParameters(params) {
    current = params;
}

export function saveParameters() {
    var paramsall = JSON.stringify(current);
    localStorage.setItem('paramsAEEC', paramsall);
}

export function chooseOutput(type, field) {
    if (type === 'dir') {
        systemCall.chooseOpenDir(function(error: number, data: any) {
            if (error === 0) {
                if (field === 'export') {
                    current.exportDest = data[0];
                    $('#export-val-dest').text(current.exportDest);
                } else {
                    current.cvtDest = data[0];
                    $('#cvt-val-dest').text(current.cvtDest);
                }
            }
        });
    } else {
        systemCall.chooseSaveFile('txt', function(error: number, data: any) {
            if (error === 0) {
                current.exportDest = data;
                $('#export-val-dest').text(current.exportDest);
            }
        });
    }
};

export function resetOutput(type, field) {
    if (type === 'dir') {
        if (field === 'export') {
            current.exportDest = '';
            $('#export-val-dest').text(current.exportDest);
        } else {
            current.cvtDest = '';
            $('#cvt-val-dest').text(current.cvtDest);
        }
    } else {
        current.exportDest = '';
        $('#export-val-dest').text(current.exportDest);
    }
};

export function stringOfParametersConvert():string {
    let p = '  -short --noerror ';
    if (current.cvtLevel !== undefined && current.cvtLevel !== 0) p += '-n ' + current.cvtLevel + ' ';
    if (current.cvtKeep) {
        let ps = current.cvtKeep.split(' ');
        for (let pse in ps)
            p += '-a "' + ps[pse] + '" ';
    }
    if (current.cvtNotkeep) {
        let ps = current.cvtNotkeep.split(' ');
        for (let pse in ps)
            p += '-s "' + ps[pse] + '" ';
    }
    if (current.cvtNormalize) p += '-normalize ' + current.cvtNormalize + ' ';
    if (current.cvtRawLine) p += '-rawline ';
    if (current.cvtDest) p += '-o ' + current.cvtDest + ' ';
    return p;
}

export function stringOfParametersQuery():string {
    let p = ' ';
    if (current.searchStr) {
        let ps = utils.parsequotes(current.searchStr);
        for (let pse in ps)
            p += '-s "' + ps[pse] + '" ';
    }
    if (current.searchKeep) {
        let ps = current.searchKeep.split(' ');
        for (let pse in ps)
            p += '-t "' + ps[pse] + '" ';
    }
    if (current.searchKwicWidth) p += '-w ' + current.searchKwicWidth + ' ';
    if (current.searchIgnorecase) p += '-p i ';
    if (current.searchAll) p += '-p a ';
    return p;
}

export function stringOfParametersExport():string {
    let p = '  -short --noerror ';
    if (current.exportKeep) {
        let ps = current.exportKeep.split(' ');
        for (let pse in ps)
            p += '-a "' + ps[pse] + '" ';
    }
    if (current.exportNotkeep) {
        let ps = current.exportNotkeep.split(' ');
        for (let pse in ps)
            p += '-s "' + ps[pse] + '" ';
    }
    if (current.exportNormalize) p += '-normalize ' + current.exportNormalize + ' ';
    if (current.exportSection) p += '-section ';
    if (current.exportRawLine) p += '-rawline ';
    if (current.exportDest) p += '-o ' + current.exportDest + ' ';
    for (let i in current.exportTV) {
        p += '-tv ' + i + '=' + current.exportTV[i] + ' ';
    }
    return p;
}
