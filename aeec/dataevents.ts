/* global dataSetEvent */
/* global TranscriptionData */
/* global $ */

import {remote} from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as childproc from 'child_process';
import * as Baby from 'babyparse';
import * as utils from './utils';
import * as teiconversion from '../tools/teiconversion';
import * as systemCall from '../systemcall/opensave';
import * as messgs from '../aeec/messgs';
import * as params from './params';
import * as lexmain from '../tools/lexmain';
import {dataSet} from './dataset'; 
import TranscriptionMeta from './transcriptionmeta'; 
export let dataSetEvent: any = dataSet;
import * as bootbox from 'bootbox';
let os = require('os');

function removeInfo() {
    let tr = $('#maincorpus tr');
    for (let i=1; i<tr.length-1; i++) {
        $(tr[i]).attr('info', '');
    }
};

function tdOn(tr: any) {
    if (!tr) return;
    if (tr.tagName) {
        if (tr.tagName === 'TD') {
            tr = $(tr).parent();
        } else if (tr.tagName === 'I') {
            tr = $(tr).parent().parent();
        } else {
            tr = $(tr);
        }
        // console.log(tr);
        $(tr).attr('selection', 'on');
        $(tr).attr('info', 'last');
        $(tr).css('background-color', '#DDAACC');
        let a = $(tr).find('td');
        $(a[0]).html('<i class="fa fa-check-square-o"></i>');
    }   
}

dataSetEvent.click = function(e) {
    //console.log("CLICK", e);
    e.preventDefault();
    let tr = e.target;
    if (e.ctrlKey || e.metaKey) {
        // select another
        removeInfo();
        tdOn(tr);
        $(tr).focus();
        return;
    } else if (e.shiftKey) {
        if (!tr) return;
        if (tr.tagName) {
            if (tr.tagName === 'TD') {
                tr = $(tr).parent();
            } else if (tr.tagName === 'I') {
                tr = $(tr).parent().parent();
            } else {
                tr = $(tr);
            }
        }
        $(tr).attr('info', 'current');
        let trList = $('#maincorpus tr');
        let last = -1;
        let current = -1;
        for (let i=1; i<trList.length-1; i++) {
            let cl = $(trList[i]).attr('info');
            if (cl === 'last') {
                last = i;
            } else if (cl === 'current') {
                current = i;
            }
        }
        if (last === -1) { // only current line is changed
            tdOn(tr);
            $(tr).focus();
            return;
        }
        if (last > current) {
            let sw = last;
            last = current;
            current = sw;
        }
        for (let i=last; i <= current; i++) {
            $(trList[i]).attr('selection', 'on');
            $(trList[i]).css('background-color', '#DDAACC');
            let a = $(trList[i]).find('td');
            $(a[0]).html('<i class="fa fa-check-square-o"></i>');
        }
        removeInfo();
        $(tr).attr('info', 'last');
    } else {
        dataSetEvent.unSelectAll();
        removeInfo();
        tdOn(tr);
        $(tr).focus();
    }
};

dataSetEvent.openCorpusFile = function(url) {
    systemCall.readFile(url, function(err, fname, data) {
        if (err === 0) {
            let table = Baby.parse(data, { delimiter: "\t" });
            dataSetEvent.initCorpus(fname);
            dataSetEvent.loadData(table.data);
        } else
            console.log('error3 ', name[0]);
    });
}

dataSetEvent.openCorpus = function() {
    systemCall.chooseOpenFile('dataSetEvent', function(err, name) {
       // console.log('openCorpus', err, name);
       if (err === 0) {
            systemCall.readFile(name[0], function(err, fname, data) {
                if (err === 0) {
                    let table = Baby.parse(data, { delimiter: "\t" });
                    $('#corpus-title').html(fname);
                    dataSetEvent.name = fname;
                    dataSetEvent.loadData(table.data);
                    dataSetEvent.saveToLocalStorage();
                } else
                    console.log('error2 ', name[0]);
            });
        } else
            console.log('error1 ', name);
    });
};

dataSetEvent.saveCorpusAs = function() {    
    systemCall.chooseSaveFile('csv', function(err, name) {
        // console.log('saveCorpusAs', err, name);
        if (err === 0) {
            dataSetEvent.name = name;
            $('#corpus-title').html(name);
            let js = dataSetEvent.toTabs(dataSetEvent.corpus);
            systemCall.writeFile(name, js, (e, d) => {
                if (e === 0) {
                    dataSetEvent.saveToLocalStorage();
                    return;
                } else {
                    console.log("saveCorpusAs: erreur d'écriture de", name);
                }
            });
        } else
            console.log("saveCorpusAs: annulé:", name);
    });
};

dataSetEvent.saveCorpus = function() {
    if (dataSetEvent.name !== messgs.m.newfile) {
        let js = dataSetEvent.toTabs(dataSetEvent.corpus);
        systemCall.writeFile(dataSetEvent.name, js, (e, d) => {
            if (e === 0) {
                dataSetEvent.saveToLocalStorage();
                return;
            } else {
                console.log("saveCorpusAs: erreur d'écriture de", name);
            }
        });
    } else
        dataSetEvent.saveCorpusAs();
};

dataSetEvent.addFile = function(name1, name2, nocheck = false) {
    if (name2 === undefined) {
        name2 = path.basename(name1);
        name1 = path.dirname(name1);
    }
    if (nocheck === true && !utils.knownExt(name2)) {
        let fl = remote.dialog.showMessageBox({
            type: 'question',
            message: 'Le fichier ' + name2 + ' est de type inconnu. Vous ne pourrez pas le traiter avec AEEC. Voulez vous le conserver.',
            buttons: ['Yes', 'No']
        });
        if (fl === 1) return;
    }
    // regarder si le fichier est déjà existant dans le corpus
    let ext = utils.extension(name2);
    let bn = utils.headname(name2);
    for (let c=0; c<dataSetEvent.corpus.length; c++) {
        if (utils.headname(dataSetEvent.corpus[c].fileName) === bn && dataSetEvent.corpus[c].pathName === name1) {
            console.log('element exists: ', name1, bn);
            dataSetEvent.notInserted += name1 + ' ' + name2 + '\n';
            return;
        }
    }
    
    let td = new TranscriptionMeta();
    td.init(name1, name2);
    td.check();
    dataSetEvent.corpus.push(td);
    let newLine = td.toHTML(dataSetEvent.display);
    let l = $('#maincorpus tbody tr:last');
    if (l.length >= 1)
        l.after(newLine);
    else {
        l = $('#maincorpus tbody');
        l.html(newLine);
    }
}

dataSetEvent.insertFile = function(e) {
    dataSetEvent.notInserted = '';
    systemCall.chooseOpenFile('trjs', function(err, name) {
        // console.log('insertFile', err, name);
        if (err === 0) {
            for (let i in name) {
                dataSetEvent.addFile(name[i]);
            }
            dataSetEvent.saveToLocalStorage();
            if (dataSetEvent.notInserted !== '') {
                remote.dialog.showMessageBox({
                    type: 'info',
                    message: dataSetEvent.notInserted + 'Ces fichiers sont dupliqués. Ils ne sont pas insérés.',
                });
            }
        } 
        // else console.log('error1 ', name);
    });
};

dataSetEvent.insertDir = function(e, filter = '') {
    dataSetEvent.notInserted = '';
    let keepUnknown = null;
    systemCall.chooseOpenDir(function(err, name) {
        // console.log('insertDir', err, name);
        if (err === 0) {
            let re;
            if (filter) {
                // test if regular expression is valid
                try {
                    re = RegExp(filter);
                } catch (e) {
                    console.log('mauvaise expression régulière');
                    filter = '';
                }
            }
            for (let i in name) {
                let contents = fs.readdirSync(name[i]);
                for (var fn in contents) {
                    if (contents[fn].indexOf('.') === 0) continue;
                    if (contents[fn].indexOf('..') === 0) continue;
                    // console.log("f= " + f);
                    if (filter && contents[fn].search(re) < 0) continue;
                    if (keepUnknown === null && !utils.knownExt(contents[fn])) {
                        let fl = remote.dialog.showMessageBox({
                            type: 'question',
                            message: 'Le fichier ' + contents[fn] + ' (et peut-être d\'autres) est de type inconnu. Vous ne pourrez pas le traiter avec AEEC.' 
                            + 'Voulez vous le conserver ? Ce choix sera appliqué pour tous les autres fichiers du répertoire.',
                            buttons: ['Yes', 'No']
                        });
                        keepUnknown = (fl === 0) ? true : false;
                        if (keepUnknown === false) continue;
                    }
                    try {
                        let fulln = path.join(name[i], contents[fn]);
                        let stat = fs.statSync( fulln );
                        //console.log(stat);
                        // let fulln = dir.lastIndexOf(path.sep) === (dir.length-1) ? f : dir + path.sep + f;
                        // fulln = path.normalize(fulln);
                        if (stat.isFile()) {
                            if (keepUnknown === false && !utils.knownExt(contents[fn])) continue;
                            let ext = path.extname(contents[fn]).toLowerCase();
                            if (ext.length > 1) ext = ext.substr(1);
                            //console.log(ext, systemCall.extTranscription.indexOf(ext));
                            if (systemCall.extTranscription.indexOf(ext) >= 0)
                                dataSetEvent.addFile(name[i], contents[fn], true);
                        }
                    } catch (error) {
                        console.log('error ' + error + ' listing: ' + name);
                    }
                };
            }
            dataSetEvent.saveToLocalStorage();
            if (dataSetEvent.notInserted !== '') {
                remote.dialog.showMessageBox({
                    type: 'info',
                    message: dataSetEvent.notInserted + 'Ces fichiers sont dupliqués. Ils ne sont pas insérés.',
                });
            }
        } 
        // else console.log('error1 ', name);
    });
};

dataSetEvent.insertDirSelect = function(e) {
    bootbox.prompt("Quels fichiers voulez vous inclure (donner une extension, une partie de nom ou une expression régulière)", function(result) {
        if (result) dataSetEvent.insertDir(e, result);
    });
};

dataSetEvent.removeLine = function() {
    let fl = remote.dialog.showMessageBox({
        type: 'question',
        message: 'Etes-vous sûr de vouloir supprimer cet/ces enregistrement(s) de la liste des fichiers ? Le fichier lui-même ne sera effacé du disque dur.',
        buttons: ['Yes', 'No']
    });
    if (fl === 1) return;
    // console.log(fl);
    let tr = $('#maincorpus tr');
    for (let i=0; i<tr.length; i++) {
        let cl = $(tr[i]).attr('selection');
        if (cl === 'on') {
            let td = $(tr[i]).find('td');
            let p = $(td[1]).text();
            let f = $(td[2]).text();
            $(tr[i]).remove();
            for (let c=0; c<dataSetEvent.corpus.length; c++) {
                if (dataSetEvent.corpus[c].fileName === (f + dataSetEvent.corpus[c].originalFormat) && dataSetEvent.corpus[c].pathName === p) {
                    dataSetEvent.corpus.splice(c,1);
                    // console.log('found ',p,f,' at ',c);
                }
            }
            // console.log(p, f);
        }
    }
};

dataSetEvent.selectAll = function() {
    let tr = $('#maincorpus tr');
    for (let i=1; i<tr.length-1; i++) {
        $(tr[i]).attr('selection', 'on');
        $(tr[i]).css('background-color', '#DDAACC');
        let a = $(tr[i]).find('td');
        $(a[0]).html('<i class="fa fa-check-square-o"></i>');
    }
};

dataSetEvent.unSelectAll = function() {
    let tr = $('#maincorpus tr');
    for (let i=1; i<tr.length-1; i++) {
        $(tr[i]).attr('selection', 'off');
        $(tr[i]).css('background-color', 'transparent');
        let a = $(tr[i]).find('td');
        $(a[0]).html('<i class="fa fa-square-o"></i>');
    }
};

dataSetEvent.action = function(act: (elts: any, fmtConvert: string, force: boolean) => void, fmtConvert = '.ignore', force = true) {
    let tr = $('#maincorpus tr');
    let tab = [];
    let nbok = 0;
    for (let i=0; i<tr.length; i++) {
        let cl = $(tr[i]).attr('selection');
        if (cl === 'on') {
            let td = $(tr[i]).find('td');
            let p = $(td[1]).text();
            let f = $(td[2]).text();
            let e = $(td[3]).text();
            tab.push({p: p, f: f, e: e, tc: $(tr[i]), c: dataSetEvent.corpus[i-1]});
            nbok++;
            // console.log(p, f, e);
            // if (typeof act === 'function') act(p, f, e, $(tr[i]), dataSetEvent.corpus[i-1], fmtConvert, force);
        }
    }
    if (nbok === 0) {
        remote.dialog.showMessageBox({
            type: 'info',
            message: 'Aucun fichiers sélectionnées ou disponibles. La commande ne peut aboutir.',
        });
        return;
    }
    act(tab, fmtConvert, force);
};

dataSetEvent.startCommand = function() {
    if (params.current.action === 'convert') {
        switch (params.current.cvtCommand) {
            case 'TEI':
                dataSetEvent.convertTei();
                break;
            case 'CLAN':
                dataSetEvent.convertClan();
                break;
            case 'ELAN':
                dataSetEvent.convertElan();
                break;
            case 'PRAAT':
                dataSetEvent.convertPraat();
                break;
            case 'TRS':
                dataSetEvent.convertTranscriber();
                break;
            default:
                console.log("unknown convertion:", params.current.cvtCommand);
                break;
        }
    } else if (params.current.action === 'query') {
        let p;
        switch (params.current.searchCommand) {
            case 'KWIC':
                p = params.stringOfParametersQuery();
                dataSetEvent.action(dataSetEvent.query, '-f k' + p, false);
                break;
            case 'COOC':
                p = params.stringOfParametersQuery();
                dataSetEvent.action(dataSetEvent.query, '-f u' + p, false);
                break;
            case 'LEX':
                p = params.stringOfParametersQuery();
                dataSetEvent.action(dataSetEvent.query, '-f l' + p, false);
                break;
            default:
                console.log("unknown query:", params.current.searchCommand);
                break;
        }
    } else if (params.current.action = 'export') {
        switch (params.current.exportCommand) {
            case 'TXM':
                dataSetEvent.exportTXM();
                break;
            case 'LEXICO':
                dataSetEvent.exportLexico();
                break;
            case 'IRAMUTEQ':
                dataSetEvent.exportIramuteq();
                break;
            default:
                console.log("unknown export:", params.current.exportCommand);
                break;
        }
    } else {
        console.log("unknown action:", params.current.action);
    }
};

dataSetEvent.exportTXM = function() {
    dataSetEvent.action(dataSetEvent.convertLineToFormat, 'txm ' + params.stringOfParametersExport(), false);
};

dataSetEvent.exportLexico = function() {
    // set lexico parameters
    dataSetEvent.action(dataSetEvent.convertLineToFormat, 'lexico ' + params.stringOfParametersExport(), false);
};

dataSetEvent.exportIramuteq = function() {
    dataSetEvent.action(dataSetEvent.convertLineToFormat, 'text -iramuteq ' + params.stringOfParametersExport(), false);
};

dataSetEvent.convertTei = function() {
    dataSetEvent.actionCheck(dataSetEvent.convertLineToFormat, utils.extTeiCorpo + params.stringOfParametersConvert()); // ou .ignore
};

dataSetEvent.convertClan = function() {
    dataSetEvent.actionCheck(dataSetEvent.convertLineToFormat, utils.extClan + params.stringOfParametersConvert());
};

dataSetEvent.convertElan = function() {
    dataSetEvent.actionCheck(dataSetEvent.convertLineToFormat, utils.extElan + params.stringOfParametersConvert());
};

dataSetEvent.convertPraat = function() {
    dataSetEvent.actionCheck(dataSetEvent.convertLineToFormat, utils.extPraat + params.stringOfParametersConvert());
};

dataSetEvent.convertTranscriber = function() {
    dataSetEvent.actionCheck(dataSetEvent.convertLineToFormat, utils.extTrs + params.stringOfParametersConvert());
};

dataSetEvent.actionCheck = function(act: (path: string, file: string, extension: string, tr: any, corpus: any) => void, fmtConvert = '.ignore', force = true) {
    let tr = $('#maincorpus tr');
    let nbselect = 0;
    for (let i=0; i<tr.length; i++) {
        let cl = $(tr[i]).attr('selection');
        if (cl === 'on') {
            nbselect++;
        }
    }
    if (nbselect >= 2) {
        let fl = remote.dialog.showMessageBox({
            type: 'question',
            message: 'Plusieurs fichiers sont sélectionnés. Etes-vous sûr de vouloir tous les traiter ?',
            buttons: ['Yes', 'No']
        });
        if (fl === 1) return;
        dataSetEvent.action(act, fmtConvert, force);
    } else {
        dataSetEvent.action(act, fmtConvert, force);
    }
};

dataSetEvent.startCmd = function(ext: string) {
    let tr = $('#maincorpus tr');
    let nbselect = 0;
    for (let i=0; i<tr.length; i++) {
        let cl = $(tr[i]).attr('selection');
        if (cl === 'on') {
            nbselect++;
        }
    }
    const nbmax = 3;
    if (nbselect > nbmax) {
        let fl = remote.dialog.showMessageBox({
            type: 'question',
                message: 'Plus de ' + nbmax + ' fichiers sont à lancer en même temps. Cette opération est peu fonctionnelle. Essayez de ne sélectionner pas plus de '  + nbmax + ' à la fois.',
            buttons: ['Yes', 'No']
        });
        if (fl === 1) return;
    }
    dataSetEvent.action(function(tab: any) {
        let cmdInstalled = utils.installCmd(ext, false);
        if (!cmdInstalled) return;
        for (let k=0; k < tab.length; k++) {
            // p: string, f: string, e: string, tc: any, c: any            
            let fn = '';
            if (tab[k].c.format[ext] !== true) {
                // convert to cmd first
                let t = [];
                t.push({p: tab[k].p, f: tab[k].f, e: tab[k].c.originalFormat, tc: tab[k].tc, c: tab[k].c});
                fn = dataSetEvent.convertLineToFormat(t, ext);
            }
            dataSetEvent.waitForCvt(() => {
                let localcmd;
                if (os.platform() === 'darwin') {
                        localcmd = 'open -a "' + cmdInstalled + '" "' + tab[k].p + '/' + tab[k].f + ext + '"';
                } else {
                    if (ext === utils.extPraat)
                        localcmd = '"' + cmdInstalled + '" --open "' + tab[k].p + '/' + tab[k].f + ext + '"';
                    else
                        localcmd = '"' + cmdInstalled + '" "' + tab[k].p + '/' + tab[k].f + ext + '"';
                }
                // executes cmd
                console.log(localcmd);
                let currdir;
                if (ext === utils.extTrs && os.platform() === 'win32') {
                    currdir = process.cwd();
                    process.chdir(path.dirname(utils.cmdsInstalled[ext]));
                }
                childproc.exec(localcmd, function (error, stdout, stderr) {
                    //console.log('stdout: ' + stdout);
                    //console.log('stderr: ' + stderr);
                    if (error !== null) {
                        // the command has failed
                        console.log('exec error: ', error);
                    }
                });
                if (ext === utils.extTrs && os.platform() === 'win32') {
                    process.chdir(currdir);
                }
            });
        }
    });
};

dataSetEvent.startTrjs = function() {
    dataSetEvent.startCmd(utils.extTeiCorpo);
};

dataSetEvent.startElan = function() {
    dataSetEvent.startCmd(utils.extElan);
};

dataSetEvent.startPraat = function() {
    dataSetEvent.startCmd(utils.extPraat);
};

dataSetEvent.startClan = function() {
    dataSetEvent.startCmd(utils.extClan);
};

dataSetEvent.startTranscriber = function() {
    dataSetEvent.startCmd(utils.extTrs);
};
