/**
 * @module teicvt.ts
 * @author Christophe Parisse
 * @description javascript interface around the java program conversions.jar
 * the basic version includes only command to convert one file to another file
 * the name of the output file is not computed automatically
 * the javacmd function send parameters directly to the java conversions.jar command without any transformation
 * this is for all other purposes than basic version
 */

import {bintools} from './bintools';
import {debug} from './debug';
import * as fs from 'fs';
import * as childproc from 'child_process';

/* Basic versions
 */

function clantotei() {
    return '"' + bintools.javaLoc() + '" -cp "' + bintools.binLoc() + '/conversions.jar" fr.ortolang.teicorpo.ClanToTei';
};
function elantotei() {
    return '"' + bintools.javaLoc() + '" -cp "' + bintools.binLoc() + '/conversions.jar" fr.ortolang.teicorpo.ElanToTei';
};
function trstotei() {
    return '"' + bintools.javaLoc() + '" -cp "' + bintools.binLoc() + '/conversions.jar" fr.ortolang.teicorpo.TranscriberToTei';
};
function praattotei() {
    return '"' + bintools.javaLoc() + '" -cp "' + bintools.binLoc() + '/conversions.jar" fr.ortolang.teicorpo.PraatToTei';
};
function teicorpo() {
    return '"' + bintools.javaLoc() + '" -cp "' + bintools.binLoc() + '/conversions.jar" fr.ortolang.teicorpo.TeiCorpo';
};

/**
 * @method format_to_tei
 * @param {string} format
 * @param {string} filein input filename
 * @param {string} fileout outpout filename
 * @param {function} callback
 */
export function formatToTei(format: string, filein: string, fileout: string, callback: (onerror: number, data: string) => void) {
    try {
        var fin = fs.realpathSync(filein);
        // var fout = fs.realpathSync(fileout);
        if (format.toLowerCase() === 'clan')
            var cmd = clantotei() + ' -i "' + fin + '" -o "' + fileout + '"';
        else if (format.toLowerCase() === 'elan')
            var cmd = elantotei() + ' -i "' + fin + '" -o "' + fileout + '"';
        else if (format.toLowerCase() === 'praat')
            var cmd = praattotei() + ' -i "' + fin + '" -o "' + fileout + '"';
        else if (format.toLowerCase() === 'transcriber')
            var cmd = trstotei() + ' -i "' + fin + '" -o "' + fileout + '"';
        else {
            console.log("erreur parametre format", format);
            callback(1, "erreur parametre format");
        }
        /*
        else if (format === 'docx') {
            try {
                if (debug(__filename)) console.log('docx readfile');
                var docxContent = fs.readFileSync(fin);
                if (debug(__filename)) console.log("XXXX" + typeof docxContent);
                if (debug(__filename)) console.log(docxContent);
                var tei = teiTools.docxToTEI(docxContent);
                if (debug(__filename)) console.log('now write to : ' + fileout);
                fs.writeFileSync(fileout, tei);
                callback(0, 'ok');
            } catch (error) {
                console.log('caught error');
                console.log(error);
                callback(1, error); // .toString());
            }
            return;
        }
        */
        if (debug(__filename))
            console.log('format_to_tei', cmd);

        // executes cmd
        childproc.exec(cmd, function (error, stdout, stderr) {
            if (debug(__filename))
                console.log('stdout: ' + stdout);
            if (debug(__filename))
                console.log('stderr: ' + stderr);
            if (error !== null) {
                // the command has failed
                // tries to find another java executable ?
                console.log('format_to_tei: exec error: ', error);
                callback(1, stdout);
            } else {
                callback(0, 'conversion finished');
            }
        });
    } catch (error) {
        console.log('Error on the conversion of ' + filein + ' to ' + fileout, error);
        return;
    }
};

function teitotrs() {
    return '"' + bintools.javaLoc() + '" -cp "' + bintools.binLoc() + '/conversions.jar" fr.ortolang.teicorpo.TeiToTranscriber';
};
function teitoclan() {
    return '"' + bintools.javaLoc() + '" -cp "' + bintools.binLoc() + '/conversions.jar" fr.ortolang.teicorpo.TeiToClan';
};
function teitoelan() {
    return '"' + bintools.javaLoc() + '" -cp "' + bintools.binLoc() + '/conversions.jar" fr.ortolang.teicorpo.TeiToElan';
};
function teitopraat() {
    return '"' + bintools.javaLoc() + '" -cp "' + bintools.binLoc() + '/conversions.jar" fr.ortolang.teicorpo.TeiToPraat';
};

/**
 * @method tei_to_format
 * @param {string} format
 * @param {string} filein input filename
 * @param {string} fileout outpout filename
 * @param {function} callback
 */
export function teiToFormat(format: string, filein: string, fileout: string, params: string, callback: (onerror: number, data: string) => void) {
    try {
        var fin = fs.realpathSync(filein);
        // var fout = fs.realpathSync(fileout);
 
        if (format.toLowerCase() === 'clan') {
            var cmd = teitoclan() + ' -i "' + filein + '" -o "' + fileout + '"';
        } else if (format.toLowerCase() === 'elan') {
            var cmd = teitoelan() + ' -i "' + filein + '" -o "' + fileout + '"';
        } else if (format.toLowerCase() === 'praat') {
            var cmd = teitopraat() + ' -i "' + filein + '" -o "' + fileout + '"';
        } else if (format.toLowerCase() === 'transcriber') {
            var cmd = teitotrs() + ' -i "' + filein + '" -o "' + fileout + '"';
        } else {
            console.log("erreur parametre format", format);
            callback(1, "erreur parametre format");
        }
        if (params) cmd += params + ' '; // add supplementary optional parameters
        if (debug(__filename))
            console.log('tei_to_format', cmd);

        // executes cmd
        childproc.exec(cmd, function (error, stdout, stderr) {
            if (debug(__filename)) console.log('stdout: ' + stdout);
            if (debug(__filename)) console.log('stderr: ' + stderr);
            if (!error) {
                callback(0, 'conversion finished');
            } else {
                if (debug(__filename)) console.log('tei_to_format: exec error: ' + error);
                callback(1, stdout);
            }
        });
    } catch (error) {
        console.log('tei_to_format: error on the conversion of ' + filein + ' to ' + fileout);
        return;
    }
};

/**
 * @method tei_to_format_input_ouput
 * @param {string} format
 * @param {string} dataInput file or data
 * @param {string} dataOutput file or data
 * @param {function} callback
 */
export function teiToFormatInputOuput(format: string, dataInput: any, dataOutput: string, callback: (onerror: number, data: any) => void) {
    try {
        if (debug(__filename)) console.log('TEI_TO_FORMAT ' + format + ' ' + dataOutput);
        var tempfn = 'tei_input' + (new Date()).getTime() + '.tei_corpo.xml';
        if (debug(__filename)) console.log('ecriture de ' + tempfn);
        fs.writeFileSync(tempfn, dataInput);

        var extension;
        if (format === 'clan') {
            extension = '.cha';
        } else if (format === 'elan') {
            extension = '.eaf';
        } else if (format === 'praat') {
            extension = '.textgrid';
        } else if (format === 'transcriber') {
            extension = '.trs';
        }
        if (debug(__filename)) console.log(extension);

        var fileout;
        // create temporary name for output if result in console
        if (dataOutput !== '*console*') {
            fileout = dataOutput;
        } else {
            fileout = 'tei_output' + (new Date()).getTime() + extension;
        }
        if (debug(__filename)) console.log(fileout);

        teiToFormat(format, tempfn, fileout, '', function(error, data) {
            if (error === 0) {
                if (dataOutput === '*console*')
                    callback(0, fs.readFileSync(fileout, {encoding: 'utf8'}));
                else 
                    callback(0, 'conversion finished');
            } else {
                callback(1, data);
            }
        });
    } catch (error) {
        // Path does not exist, it is ok
        callback(1, 'tei_to_format: error: cannot save temporary file before conversion to transcriber' + tempfn);
        return;
    }
};

/*
console.log('bin=', bintools.binLoc());
console.log('java=', bintools.javaLoc());
console.log('ffmpeg=', bintools.ffmpegLoc());
console.log('ffprobe=', bintools.ffprobeLoc());
*/

/**
 * @method teiGeneric : generic function with command line
 * @param {string} cmd
 * @param {function} callback
 */
export function teiGeneric(cmd: string, callback: (onerror: number, data: string) => void) {
    try {
        cmd = teicorpo() + ' ' + cmd;
        //if (debug(__filename))
            console.log('teiCorpo', cmd);
        // executes cmd
        childproc.exec(cmd, function (error, stdout, stderr) {
            if (debug(__filename)) console.log('stdout: ' + stdout);
            if (debug(__filename)) console.log('stderr: ' + stderr);
            if (!error) {
                callback(0, 'conversion finished');
            } else {
                if (debug(__filename)) console.log('teiCorpo: exec error: ' + error);
                callback(1, stdout);
            }
        });
    } catch (error) {
        console.log('teiCorpo: error on the conversion of', cmd);
        return;
    }
};
