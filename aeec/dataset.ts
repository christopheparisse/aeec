/**
 * 
 */

import {remote} from 'electron';
import TranscriptionMeta from './transcriptionmeta';
import * as fs from 'fs';
import * as utils from './utils';
import * as teiconversion from '../tools/teiconversion';
import * as lexmain from '../tools/lexmain';
import * as bootbox from 'bootbox';

export let dataSet: any;

dataSet = {
    name: '',
    corpus: null,
    display: null,
    cvtWaitToken: false,

    /*
    function addPlus(t, s) {
        return '\t' + (t ? '+' + s : s);
    }

    aeec.toHeader = function(tag) {
        // creation de l'entête
        let s = tag;
        s += addPlus(dataSet.display.fileName, 'fileName');
        s += addPlus(dataSet.display.pathName, 'pathName');
        s += addPlus(dataSet.display.title, 'title');
        s += addPlus(dataSet.display.creationDate, 'creationDate');
        s += addPlus(dataSet.display.modificationDate, 'modificationDate');
        s += addPlus(dataSet.display.originalFormat, 'format');
        s += addPlus(dataSet.display.media, 'media');
        return s;
    };
    */
};

dataSet.initCorpus = function(name) {
    console.log('initCorpus');
    $('#corpus-title').html(name);
    dataSet.name = name;
    let dt = $('#maincorpus');
    dt.html('<thead><tr><td><i class="fa fa-plus-square"></i></td><td>Repertoire</td><td>Fichier</td><td>Format origine</td>'
        + '<td>TEI</td><td>Clan</td><td>Elan</td><td>Praat</td><td>Trs</td></tr></thead>'
        + '<tbody>'
        + '</tbody>'
        + '<tfoot><tr><td><i class="fa fa-plus-square"></i></td><td>Repertoire</td><td>Fichier</td><td>Format origne</td>'
        + '<td>TEI</td><td>Clan</td><td>Elan</td><td>Praat</td><td>Trs</td></tr></tfoot>'
    );
    dataSet.corpus = [];
    dataSet.display = new TranscriptionMeta();
    dataSet.display.fileName = true;
    dataSet.display.pathName = true;
    dataSet.display.originalFormat = true;
    dataSet.display.format[utils.extTeiCorpo] = true;
    dataSet.display.format[utils.extClan] = true;
    dataSet.display.format[utils.extElan] = true;
    dataSet.display.format[utils.extPraat] = true;
    dataSet.display.format[utils.extTrs] = true;
    dataSet.display.title = false;
    dataSet.display.creationDate = false;
    dataSet.display.modificationDate = false;
    dataSet.display.media = false;
};

dataSet.loadData = function(data) {
    console.log('loadData');
    dataSet.corpus = [];
    dataSet.display = new TranscriptionMeta();
    dataSet.display.fileName = true;
    dataSet.display.pathName = true;
    dataSet.display.originalFormat = true;
    dataSet.display.format[utils.extTeiCorpo] = true;
    dataSet.display.format[utils.extClan] = true;
    dataSet.display.format[utils.extElan] = true;
    dataSet.display.format[utils.extPraat] = true;
    dataSet.display.format[utils.extTrs] = true;
    dataSet.display.title = false;
    dataSet.display.creationDate = false;
    dataSet.display.modificationDate = false;
    dataSet.display.media = false;
    let s = '';
    for (let i=0; i < data.length; i++) {
        if (data[i].length < 2) continue;
        let td = new TranscriptionMeta();
        td.init(data[i][0], data[i][1]);
        td.check();
        let l = td.toHTML(dataSet.display);
        dataSet.corpus.push(td);
        s += l;
    }
    let hd = $('#maincorpus tbody')
    if (hd.length < 1) {
        let dt = $('#maincorpus');
        dt.append('<tbody></tbody>')
        hd = $('#maincorpus tbody')
    }
    hd.html(s);
};

dataSet.saveToLocalStorage = function() {
    try {
        if (dataSet.corpus.length >= 0) {
            let js = {
                name: dataSet.name,
                display: dataSet.display,
                corpus: []
            }
            console.log('saveToLocalStorage', dataSet.corpus);
            for (let i in dataSet.corpus) {
                js.corpus.push([dataSet.corpus[i].pathName, dataSet.corpus[i].fileName]);
            }
            localStorage.setItem('previousData', JSON.stringify(js, null, 4));
        }
    } catch (error) {
        console.log('save in localStorage failed');
    }
};

dataSet.toTabs = function (data) {
    let s = '';
    for (let i=0 ; i<data.length; i++) {
        /*
        for (let j=0; j<data[i].length-1; j++) {
            s += data[i][j] + '\t';
        }
        s += data[i][j];
        */
        s += '"' + data[i].pathName + '"\t"' + data[i].fileName + '"';
        s += '\n';
    }
    return s;
};

dataSet.waitForCvt = function(fun: () => void) {
    console.log('waiting for cvt');
    if (dataSet.cvtWaitToken === false) {
        fun();
        return;
    }
    let start = Date.now();
    let conversionInterval = setInterval(() => {
        if (dataSet.cvtWaitToken === false) {
            fun();
            clearInterval(conversionInterval);
            return;
        }
        if (Date.now() > start + 120000) {
            clearInterval(conversionInterval);
            return;
        }
    }, 500);
};

dataSet.query = function(tab: any, fmtConvert, force = false) {
    /*
    if (fmtConvert === utils.extTeiCorpo) {
        // voir s'il y a des fichiers input qui nécessitent des arguments spécifique comme par exemple Praat
        for (let k=0; k < tab.length; k++) {
            if (tab[k].e === utils.extPraat) {
                let fn = tab[k].p + "/" + tab[k].f + tab[k].e;
                // recuperer les noms de tiers
            }
        }
    }
    */
    // tab = array of p: string, f: string, e: string, tc: any, c: any
    // créer une ligne de commande avec le travail à faire
    let cmd = fmtConvert;
    let missing = [];
    let nbok = 0;
    for (let k=0; k < tab.length; k++) {
        let fout = tab[k].p + "/" + tab[k].f + utils.extTeiCorpo;
        if (tab[k].c.format[utils.extTeiCorpo] !== true) {
            // do not convert
            // signal the error
            missing.push(fout);
        } else {
            nbok++;
            cmd += fout + ' ';
        }
    }
    if (missing.length > 0) {
        let missings = missing.join('\n');
        remote.dialog.showMessageBox({
            type: 'info',
            message: "Ces fichiers doivent être d'abord convertis au format TEI:\n" + missings + "Utiliser la procédure de conversion pour cela.",
        });
    }
    if (nbok === 0) {
        remote.dialog.showMessageBox({
            type: 'info',
            message: 'Aucun fichiers sélectionnées ou disponibles. La commande ne peut aboutir.',
        });
        return;
    }
    console.log('query ', cmd);
    // executes cmd
    lexmain.query(cmd);
};

dataSet.convertLineToFormat = function(tab: any, fmtConvert = '.ignore', force = false) {
    /*
    if (fmtConvert === utils.extTeiCorpo) {
        // voir s'il y a des fichiers input qui nécessitent des arguments spécifique comme par exemple Praat
        for (let k=0; k < tab.length; k++) {
            if (tab[k].e === utils.extPraat) {
                let fn = tab[k].p + "/" + tab[k].f + tab[k].e;
                // recuperer les noms de tiers
            }
        }
    }
    */
    // tab = array of p: string, f: string, e: string, tc: any, c: any
    // créer une ligne de commande avec le travail à faire
    let cmd = '';
    if (fmtConvert !== '.ignore')
        cmd = '-to ' + fmtConvert + ' ';
    for (let k=0; k < tab.length; k++) {
        let fout = tab[k].p + "/" + tab[k].f + tab[k].e;
        // if (force) {
            // if it was necassary indicate to command that destination file can be overwritten
            // not necessary as it is the default behavior
        // }
        cmd += fout + ' ';
    }
    // console.log('convertlineToTei ', cmd);
    // executes cmd
    dataSet.cvtWaitToken = true;
    teiconversion.teiGeneric(cmd, function (error, data) {
        //console.log('stdout: ' + stdout);
        //console.log('stderr: ' + stderr);
        dataSet.cvtWaitToken = false;
        if (error !== 0) {
            // the command has failed
            // tries to find another java executable ?
            console.log('exec error: ', error);
            remote.dialog.showMessageBox({
                type: 'info',
                message: "Traitement terminé avec erreur : " + error.toString(),
            });
        } else {
            if (tab.length > 1) {
                bootbox.alert("Traitement terminé.");
            }
            setTimeout(function(){
                bootbox.hideAll();
            }, 3000); // 3 seconds expressed in milliseconds
            for (let k=0; k < tab.length; k++) {
                tab[k].c.check();
                let l: string = tab[k].c.toHTML(dataSet.display);
                l = l.substr(utils.headLineTR.length);
                l = l.substr(0,l.length-4);
                tab[k].tc.html(l);
            }
        }
    });
};

dataSet.setMaster = function(ext: string) {
    let tr = $('#maincorpus tr');
    for (let i=0; i<tr.length; i++) {
        let cl = $(tr[i]).attr('selection');
        if (cl === 'on') {
            let td = $(tr[i]).find('td');
            let p = $(td[1]).text();
            let f = $(td[2]).text();
            let e = $(td[3]).text();
            //console.log('setMaster', p, f, e, ext);
            for (let k in dataSet.corpus) {
                //console.log(dataSet.corpus[k].pathName, dataSet.corpus[k].fileName, dataSet.corpus[k]);
                if (dataSet.corpus[k].pathName === p && utils.headname(dataSet.corpus[k].fileName) === f) {
                    if (e === ext) continue;
                    let newfn = p + '/' + f + ext;
                    if (!fs.existsSync(newfn)) {
                        // the file did not exist
                        // convert it from the old master
                        console.log('file does exist create it');
                        // tab = array of p: string, f: string, e: string, tc: any, c: any
                        let tab = [{ p: p, f: f, e: e, tc: $(tr[i]), c: dataSet.corpus[k]}];
                        dataSet.convertLineToFormat(tab, ext);
                    }
                    dataSet.waitForCvt(() => {
                        dataSet.corpus[k].setMaster(ext);
                        // dataSet.corpus[k].toHTML(dataSet.display);
                        let l: string = dataSet.corpus[k].toHTML(dataSet.display);
                        l = l.substr(utils.headLineTR.length);
                        l = l.substr(0,l.length-4);
                        $(tr[i]).html(l);
                    });
                }
            }
        }
    }
    dataSet.saveToLocalStorage();
};
