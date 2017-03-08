/**
 * @module init.ts
 */

import {ipcRenderer} from 'electron';
import * as systemCall from '../systemcall/opensave';
import {dataSetEvent as dataSetInterface} from './dataevents';
import * as Baby from 'babyparse';
import * as utilsCommand from './utils';
import * as messgs from './messgs';
import * as params from './params';
import * as praat from './praat';
import * as childproc from 'child_process';
let os = require('os');

export const click = dataSetInterface.click;
export const event = dataSetInterface;
export const utils = utilsCommand;

export function call(pathname, time) {
    let cmdInstalled = utils.installCmd(utils.extTeiCorpo, false);
    if (!cmdInstalled) return;
    let localcmd;
    if (os.platform() === 'darwin') {
            localcmd = 'open -a "' + cmdInstalled + '" "' + pathname + '"';
    } else {
            localcmd = '"' + cmdInstalled.replace(/\\/g, '/') + '" "' + pathname.replace(/\\/g, '/') + '"';
    }
    localcmd += ' --args --tm ' + time + ' --play';
    // executes cmd
    console.log(localcmd);
    let currdir;
    childproc.exec(localcmd, function (error, stdout, stderr) {
        //console.log('stdout: ' + stdout);
        //console.log('stderr: ' + stderr);
        if (error !== null) {
            // the command has failed
            console.log('exec error: ', error);
        }
    });
}

export function init() {
    document.title = "Agrégateur, explorateur, éditeur de corpus";
    let remote = require('electron').remote;
    let argv = remote.process.argv;
    //console.log(argv);
    let args = require('minimist')(remote.process.argv);
    //console.log(args);
    let url = '';
    if (args._ !== undefined) {
        if (args._.length > 2 && (remote.process.defaultApp === true || utils.extension(args._[1]) !== '.js')) {
            url = args._[2].replace(/\\/g, '/');
        } else if (args._.length > 1 && utils.extension(args._[1]) !== '.js') {
            url = args._[1].replace(/\\/g, '/');
        }
        if (url) {
            dataSetInterface.openCorpusFile(url);
        }
    }
    if (!url) {
        // load previous data
        try {
            if (localStorage.getItem('previousData')) {
                let js = JSON.parse(localStorage.getItem('previousData'));
                dataSetInterface.initCorpus(js.name);
                dataSetInterface.display = js.display;
                dataSetInterface.loadData(js.corpus);
            } else {
                dataSetInterface.initCorpus(messgs.m.newfile);
                dataSetInterface.saveToLocalStorage();
            }
        } catch (error) {
            dataSetInterface.initCorpus(messgs.m.newfile);
            dataSetInterface.saveToLocalStorage();
        }
    }

    ipcRenderer.on('new', function(event, arg) {
        dataSetInterface.initCorpus(messgs.m.newfile);
        dataSetInterface.saveToLocalStorage();
    });
    ipcRenderer.on('open', function(event, arg) {
        dataSetInterface.openCorpus();
    });
    ipcRenderer.on('opencorpusfile', function(event, arg) {
        console.log('opencorpusfile', event, arg);
        dataSetInterface.openCorpusFile(arg);
    });
    ipcRenderer.on('save', function(event, arg) {
        dataSetInterface.saveCorpus();
    });
    ipcRenderer.on('saveas', function(event, arg) {
        dataSetInterface.saveCorpusAs();
    });
    ipcRenderer.on('insertfile', function(event, arg) {
        dataSetInterface.insertFile();
    });
    ipcRenderer.on('insertdir', function(event, arg) {
        dataSetInterface.insertDir();
    });
    ipcRenderer.on('insertdirselect', function(event, arg) {
        dataSetInterface.insertDirSelect();
    });
    ipcRenderer.on('removeline', function(event, arg) {
        dataSetInterface.removeLine();
    });
    ipcRenderer.on('starttrjs', function(event, arg) {
        dataSetInterface.startTrjs();
    });
    ipcRenderer.on('startclan', function(event, arg) {
        dataSetInterface.startClan();
    });
    ipcRenderer.on('startelan', function(event, arg) {
        dataSetInterface.startElan();
    });
    ipcRenderer.on('startpraat', function(event, arg) {
        dataSetInterface.startPraat();
    });
    ipcRenderer.on('starttranscriber', function(event, arg) {
        dataSetInterface.startTranscriber();
    });
    ipcRenderer.on('converttei', function(event, arg) {
        dataSetInterface.convertTei();
    });
    ipcRenderer.on('convertclan', function(event, arg) {
        dataSetInterface.convertClan();
    });
    ipcRenderer.on('convertelan', function(event, arg) {
        dataSetInterface.convertElan();
    });
    ipcRenderer.on('convertpraat', function(event, arg) {
        dataSetInterface.convertPraat();
    });
    ipcRenderer.on('converttranscriber', function(event, arg) {
        dataSetInterface.convertTranscriber();
    });
    ipcRenderer.on('setmastertei', function(event, arg) {
        dataSetInterface.setMaster(utilsCommand.extTeiCorpo);
    });
    ipcRenderer.on('setmasterclan', function(event, arg) {
        dataSetInterface.setMaster(utilsCommand.extClan);
    });
    ipcRenderer.on('setmasterelan', function(event, arg) {
        dataSetInterface.setMaster(utilsCommand.extElan);
    });
    ipcRenderer.on('setmasterpraat', function(event, arg) {
        dataSetInterface.setMaster(utilsCommand.extPraat);
    });
    ipcRenderer.on('setmastertranscriber', function(event, arg) {
        dataSetInterface.setMaster(utilsCommand.extTrs);
    });
    ipcRenderer.on('changeprogassoc', function(event, arg) {
        utilsCommand.changeProgAssoc();
    });
    ipcRenderer.on('saveparameters', function(event, arg) {
        let active = $('div.tab-pane.active');
        if (active.length > 0) {
            switch ($(active[0]).attr('id')) {
                case 'pconvert':
                    params.current.action = 'convert';
                    break;
                case 'psearch':
                    params.current.action = 'query';
                    break;
                case 'pexport':
                    params.current.action = 'export';
                    break;
                default:
                    break;
            }
        }
        params.saveParameters();
    });

    initHTML();
    initParameters();
};

function initHTML() {
    $("#newcorpus").click(() => {
        dataSetInterface.initCorpus(messgs.m.newfile);
        dataSetInterface.saveToLocalStorage();
    });
    $("#opencorpus").click(dataSetInterface.openCorpus);
    $("#selectall").click(dataSetInterface.selectAll);
    $("#deselectall").click(dataSetInterface.unSelectAll);
    $("#insertfile").click(dataSetInterface.insertFile);
    $("#insertdir").click(dataSetInterface.insertDir);
    $("#starttrjs").click(dataSetInterface.startTrjs);
    $("#startclan").click(dataSetInterface.startClan);
    $("#startelan").click(dataSetInterface.startElan);
    $("#startpraat").click(dataSetInterface.startPraat);
    $("#starttrs").click(dataSetInterface.startTranscriber);
    // Autres
    $(".blocicons").css( 'cursor', 'pointer' );
    /*
    $("#cvttei").click(dataSetInterface.convertTei);
    $("#exporttxm").click(dataSetInterface.exportTXM);
    $("#exportiramuteq").click(dataSetInterface.exportIramuteq);
    $("#exportlexico").click(dataSetInterface.exportLexico);
    $("#searchcorpus").click(dataSetInterface.searchCorpus);
    $("#searchcorpus").click(dataSetInterface.lexiconCorpus);
    $("#).change(() => { params.current. = $('#').val(); });
    */
    // CONVERT
    $("#cvt-tei").change(() => { params.current.cvtCommand = 'TEI'; });
    $("#cvt-clan").change(() => { params.current.cvtCommand = 'CLAN'; });
    $("#cvt-elan").change(() => { params.current.cvtCommand = 'ELAN'; });
    $("#cvt-praat").change(() => { params.current.cvtCommand = 'PRAAT'; });
    $("#cvt-trs").change(() => { params.current.cvtCommand = 'TRS'; });
    $("#cvt-accept-tiers").change(() => { params.current.cvtKeep = $('#cvt-accept-tiers').val(); });
    $("#cvt-suppress-tiers").change(() => { params.current.cvtNotkeep = $('#cvt-suppress-tiers').val(); });
    $("#cvt-tiers-level").change(() => { params.current.cvtLevel = $('#cvt-tiers-level').val(); });
    $("#cvt-tiers-normalize").change(() => { params.current.cvtNormalize = $('#cvt-tiers-normalize').val(); });
    $("#cvt-tiers-target").change(() => { params.current.cvtTarget = $('#cvt-tiers-target').val(); });
    $("#cvt-text-rawline").change(() => { params.current.cvtRawLine = $('#cvt-text-rawline').is(':checked'); });
    $("#cvt-choose-dest").click(() => {
        params.chooseOutput('dir', 'convert');
    });
    $("#cvt-erase-dest").click(() => {
        params.resetOutput('dir', 'convert');
    });
    // sets the modifier function
    $("#convert-praat-options").change(() => {
        params.current.cvtPraatOptions = $('#convert-praat-options').is(':checked');
        if (params.current.cvtPraatOptions === true) {
          $('#praat-options').show();
          praat.fillOptions();
        } else {
          $('#praat-options').hide();
        }
    });
    $("#reload-praat-options").click(praat.fillOptions);
    $("#convert-praat-reset").click(praat.resetOptions);
    // sets initial state
    if (params.current.cvtPraatOptions === true) {
        $('#praat-options').show();
        praat.fillOptions();
    } else {
        $('#praat-options').hide();
    }
    // QUERY
    $("#search-kwic").change(() => { params.current.searchCommand = 'KWIC'; });
    $("#search-cooc").change(() => { params.current.searchCommand = 'COOC'; });
    $("#search-lex").change(() => { params.current.searchCommand = 'LEX'; });
    $("#search-string").change(() => { params.current.searchStr = $('#search-string').val(); });
    $("#search-tiers").change(() => { params.current.searchKeep = $('#search-tiers').val(); });
    $("#kwic-width").change(() => { params.current.searchKwicWidth = $('#kwic-width').val(); });
    $("#ignore-case").change(() => { params.current.searchIgnorecase = $('#ignore-case').is(':checked'); });
    $("#all-data").change(() => { params.current.searchAll = $('#all-data').is(':checked'); });
    // EXPORT
    $("#export-txm").change(() => { params.current.exportCommand = 'TXM'; });
    $("#export-lexico").change(() => { params.current.exportCommand = 'LEXICO'; });
    $("#export-iramuteq").change(() => { params.current.exportCommand = 'IRAMUTEQ'; });
    $("#export-accept-tiers").change(() => { params.current.exportKeep = $('#export-accept-tiers').val(); });
    $("#export-suppress-tiers").change(() => { params.current.exportNotkeep = $('#export-suppress-tiers').val(); });
    $("#export-tiers-normalize").change(() => { params.current.exportNormalize = $('#export-tiers-normalize').val(); });
    $("#export-text-rawline").change(() => { params.current.exportRawLine = $('#export-text-rawline').is(':checked'); });
    $("#export-tv-button").click(() => {
        console.log($('#export-tv-type').val());
        console.log($('#export-tv-val').val());
        if ($('#export-tv-val').val()) {
            params.exportTVSet(params.current, $('#export-tv-type').val(), $('#export-tv-val').val() );
        } else {
            params.exportTVDelete(params.current, $('#export-tv-type').val() );
        }
        $('#export-tv-display').html(params.exportTVHTML(params.current));
        // console.log(params.current.exportTV);
        // console.log(params.exportTVHTML(params.current));
    });
    $("#export-tv-reset").click(() => {
        params.exportTVReset(params.current);
        $('#export-tv-display').html(params.exportTVHTML(params.current));
    });
    $("#export-section").change(() => { params.current.exportSection = $('#export-section').is(':checked'); });
    $("#export-choose-dest").click(() => {
        if (params.current.exportCommand === 'IRAMUTEQ') {
            params.chooseOutput('file', 'export');
        } else {
            params.chooseOutput('dir', 'export');
        }
    });
    // TOUS = START
    $("#startcmd").click(startCommand);
}

function initParameters() {
    let savedParams = params.loadSavedParameters();
    if (!savedParams) return;
    params.loadParameters(savedParams);

    $('#pconvert').attr('class', 'tab-pane');
    $('#psearch').attr('class', 'tab-pane');
    $('#pexport').attr('class', 'tab-pane');
    $('#tconvert').attr('class', '');
    $('#tsearch').attr('class', '');
    $('#texport').attr('class', '');
    if (savedParams.action === 'convert') {
        $('#pconvert').attr('class', 'tab-pane active');
        $('#tconvert').attr('class', 'active');
    } else if (savedParams.action === 'query') {
        $('#psearch').attr('class', 'tab-pane active');
        $('#tsearch').attr('class', 'active');
    } else {
        $('#pexport').attr('class', 'tab-pane active');
        $('#texport').attr('class', 'active');
    }
    // CONVERT
    if (savedParams.cvtCommand === 'TEI')
        $('input:radio[name="cvt-command"]').filter('[value="0"]').attr('checked', 'true');
    else if (savedParams.cvtCommand === 'CLAN')
        $('input:radio[name="cvt-command"]').filter('[value="1"]').attr('checked', 'true');
    else if (savedParams.cvtCommand === 'ELAN')
        $('input:radio[name="cvt-command"]').filter('[value="2"]').attr('checked', 'true');
    else if (savedParams.cvtCommand === 'PRAAT')
        $('input:radio[name="cvt-command"]').filter('[value="3"]').attr('checked', 'true');
    else
        $('input:radio[name="cvt-command"]').filter('[value="4"]').attr('checked', 'true');
    $("#cvt-accept-tiers").val(savedParams.cvtKeep);
    $("#cvt-suppress-tiers").val(savedParams.cvtNotkeep);
    $("#cvt-tiers-level").val(savedParams.cvtLevel);
    $("#cvt-tiers-normalize").val(savedParams.cvtNormalize);
    $("#cvt-tiers-target").val(savedParams.cvtTarget);
    $("#cvt-text-rawline").prop('checked', savedParams.cvtRawLine);
    $("#cvt-val-dest").text(savedParams.cvtDest);
    if (savedParams.cvtPraatOptions) {
        $('#convert-praat-options').prop('checked', true);
        $('#praat-options').show();
        // praat.fillOptions();
    } else {
        $('#convert-praat-options').prop('checked', false);
        $('#praat-options').hide();
    }

    // QUERY
    if (savedParams.searchCommand === 'KWIC')
        $('input:radio[name="search-command"]').filter('[value="0"]').attr('checked', 'true');
    else if (savedParams.searchCommand === 'COOC')
        $('input:radio[name="search-command"]').filter('[value="1"]').attr('checked', 'true');
    else
        $('input:radio[name="search-command"]').filter('[value="2"]').attr('checked', 'true');
    $('#search-string').val(savedParams.searchStr);
    $('#search-tiers').val(savedParams.searchKeep);
    $('#kwic-width').val(savedParams.searchKwicWidth);
    $("#ignore-case").prop('checked', savedParams.searchIgnorecase);
    $("#all-data").prop('checked', savedParams.searchAll);
    // EXPORT
    if (savedParams.exportCommand === 'TXM')
        $('input:radio[name="export-command"]').filter('[value="0"]').attr('checked', 'true');
    else if (savedParams.exportCommand === 'LEXICO')
        $('input:radio[name="export-command"]').filter('[value="1"]').attr('checked', 'true');
    else
        $('input:radio[name="export-command"]').filter('[value="2"]').attr('checked', 'true');
    $("#export-accept-tiers").val(savedParams.exportKeep);
    $("#export-suppress-tiers").val(savedParams.exportNotkeep);
    $("#export-tiers-normalize").val(savedParams.exportNormalize);
    $("#export-text-rawline").prop('checked', savedParams.exportRawLine);
    $('#export-tv-display').html(params.exportTVHTML(savedParams));
    $("#export-section").prop('checked', savedParams.exportSection);
    $("#export-val-dest").text(savedParams.exportDest);
}

function startCommand() {
    let active = $('div.tab-pane.active');
//    console.log("active is:", active.length > 0 ? $(active[0]).attr('id') : 'aucun');
    if (active.length > 0) {
        switch ($(active[0]).attr('id')) {
            case 'pconvert':
                params.current.action = 'convert';
                break;
            case 'psearch':
                params.current.action = 'query';
                break;
            case 'pexport':
                params.current.action = 'export';
                break;
            default:
                break;
        }
    }
    params.saveParameters();
    dataSetInterface.startCommand();
}
