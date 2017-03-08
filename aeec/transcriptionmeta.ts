/**
 * @module transcriptionmeta.ts
 * structure of the data for each element in a corpus (dataSet)
 */
import * as fs from 'fs';
import * as utils from './utils';

export default class TranscriptionMeta {
    // les données dans le fichier sont dans le même ordre
    fileName = ''; // nom sans extension
    pathName = ''; // nom de répertoire
    originalFormat = '';   // selon disponibilité dans le même répertoire
    format = {};
    moreRecent = {}; // are the different formats more recent than the master (original) format
    title = '';    // titre du document (pour TEI)
    creationDate = ''; // date de création (pour XML)
    modificationDate = ''; // date de modification (pour XML)
    media = {}; // liste de médias (pour plus tard)
    constructor() {
        this.media = {};
    }

/*
    // fonction de manipulation des données

    // ecriture dans une chaine à destination de XML
    this.toXML = function(n) {
        let s = n + '\t';
        s += this.fileName + '\t';
        s += this.pathName + '\t';
        s += this.title + '\t';
        s += this.creationDate + '\t';
        s += this.modificationDate + '\t';
        s += this.originalFormat + '\t';
        s += this.media;
        return s;
    }

    // lecture d'une chaine venant de XML
    this.fromXML = function(tabs) {
        let s;
        this.fileName = tabs[1];
        this.pathName = tabs[2];
        this.title = tabs[3];
        this.creationDate = tabs[4];
        this.modificationDate = tabs[5];
        this.originalFormat = tabs[6];
        this.media = tabs[7];
        return s;
    }
*/
    toHTML(display) {
        let s = utils.headLine;
        if (display.pathName)
            s += '<td>' + this.pathName + '</td>';
        if (display.fileName)
            s += '<td>' + utils.headname(this.fileName) + '</td>';
        if (display.originalFormat)
            s += '<td>' + this.originalFormat + '</td>';
        if (display.format[utils.extTeiCorpo]) {
            s += '<td>';
            if (this.moreRecent[utils.extTeiCorpo] === true)
                s += '<i class="fa fa-hand-o-up colored"></i>';
            else if (this.format[utils.extTeiCorpo]===true)
                s += '<i class="fa fa-hand-o-up"></i>';
            s += '</td>';
        }
        if (display.format[utils.extClan]) {
            s += '<td>';
            if (this.moreRecent[utils.extClan] === true)
                s += '<i class="fa fa-hand-o-up colored"></i>';
            else if (this.format[utils.extClan]===true)
                s += '<i class="fa fa-hand-o-up"></i>';
            s += '</td>';
        }
/*        if (display.format[utils.extClan])
            s += '<td>' + (this.format[utils.extClan]===true?'<i class="fa fa-hand-o-up"></i>':'') + '</td>';
*/
        if (display.format[utils.extElan])
            s += '<td>' + (this.format[utils.extElan]===true?'<i class="fa fa-hand-o-up"></i>':'') + '</td>';
        if (display.format[utils.extPraat])
            s += '<td>' + (this.format[utils.extPraat]===true?'<i class="fa fa-hand-o-up"></i>':'') + '</td>';
        if (display.format[utils.extTrs])
            s += '<td>' + (this.format[utils.extTrs]===true?'<i class="fa fa-hand-o-up"></i>':'') + '</td>';
        if (display.title)
            s += '<td>' + this.title + '</td>';
        if (display.creationDate)
            s += '<td>' + this.creationDate + '</td>';
        if (display.modificationDate)
            s += '<td>' + this.modificationDate + '</td>';
        if (display.media)
            s += '<td>' + this.media + '</td>';
        s += '</tr>';
        return s;
    }

    init(dir: string, fn: string) {
        this.fileName = fn;
        this.pathName = dir;
        if (typeof fn === 'string')
            this.originalFormat = utils.extension(fn);
    }

    checkFormat(ext: string) {
        if (this.originalFormat === ext) {
            this.format[ext] = true;
        } else {
            let fn;
            //fn = this.pathName + '/' + this.fileName;
            fn = this.pathName + '/' + utils.headname(this.fileName) + ext;
            try {
                if (fs.existsSync(fn)) this.format[ext] = true;
                // and here check if this file is more recent than the master file
                let tmMaster = fs.statSync(this.pathName + '/' + utils.headname(this.fileName) + this.originalFormat);
                let tmCvt = fs.statSync(fn);
                if (tmMaster.ctime < tmCvt.ctime) this.moreRecent[ext] = true;
            } catch (error) {
                this.format[ext] = false;
            }
        }
    };

    checkFormatVariant(ext: string, fmt: string) {
        if (this.originalFormat === ext) {
            this.format[fmt] = true;
        } else {
            let fn;
            //fn = this.pathName + '/' + this.fileName;
            fn = this.pathName + '/' + utils.headname(this.fileName) + ext;
            try {
                if (fs.existsSync(fn)) this.format[fmt] = true;
            } catch (error) {
                return;
            }
        }
    };

    setMaster(ext: string) {
        if (this.originalFormat === ext) {
            return; // already the format
        } else {
            this.originalFormat = ext;
        }
    }
    
    check() {
        this.checkFormat(utils.extTeiCorpo);
        this.checkFormatVariant(utils.extTrjs, utils.extTeiCorpo);
        this.checkFormat(utils.extClan);
        this.checkFormat(utils.extElan);
        this.checkFormat(utils.extPraat);
        this.checkFormat(utils.extTrs);
    };
}
