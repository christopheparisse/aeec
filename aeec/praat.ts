/**
 * praat.ts
 * manage praat special conversion options
 */

import * as fs from 'fs';

export let praat:any = {}; // for praat conversion to tei parameters
import * as systemCall from '../systemcall/opensave';

praat.options = true;
praat.params = '';
praat.relations = [];
praat.restore = null;
praat.names = {};

export function fillOptions() {
    // TODO
}

export function resetOptions() {
    // TODO
}

export function getOptionsTextGrid(fname) {
    if (!praat.restore) {
        // this the first use of this page for this session
        let params = localStorage.getItem('paramsPraatRelations');
        if (params) {
            params = JSON.parse(params);
            if (params) praat.relations = params;
        }
        praat.restore = 'done';
        praat.options = true;
        // compute the parameters.
        // praat.params = computeParams();
        // alert("optionsTextGrid " + praat.params);
    }
    let names = readNamesTextGrid(fname);
    for (let i in names) {
        praat.names[names[i]] = 'tier';
    }
}

export function visuOptionsTextGrid() {
        $('#convert-paramspraat').show();
        var t = '<table><thead><tr><th>Tier</th><th>Relation</th><th>Parent</th></tr></thead><tbody><tr><td>';
        for (var i=0; i<praat.names.length; i++) {
            t += '<input type="radio" name="praatleft" value="l' + i + '"/> ' + praat.names[i] + '<br />';
        }
        t += '</td><td>';
        t += '<input type="radio" name="praatmiddle" value="assoc"/>Association symbolique<br />';
        t += '<input type="radio" name="praatmiddle" value="timediv"/>Division temporelle<br />';
        t += '<input type="radio" name="praatmiddle" value="incl"/>Inclusion temporelle<br />';
        t += '</td><td>';
        for (var i=0; i<praat.names.length; i++) {
            t += '<input type="radio" name="praatright" value="r' + i + '"> ' + praat.names[i] + '<br />';
        }
        t += '</td><td><input id="praatajoutrelation" type="button" value="Ajouter la relation" onclick="addRelation();"/></td></tr></tbody></table>';
        $('#convert-praatlist').html(t).show();
        $('#convert-praatrules').html('').show();
        displayRelation();
}

function readNamesTextGrid(fn) {
    let obj = systemCall.readBinaryFileSync(fn);
    var lns = obj.toString().split(/[\n\r]+/);
    var names = [];
    for (var i=0; i<lns.length; i++) {
//        if (lns[i].indexOf('name') >= 0)
//          console.log(i+1 + ' ' + lns[i]);
        var t = /\s+name\s+=\s+"(.+)".*/.exec(lns[i]);
        if (t)
            names.push(t[1]);
    }
    return names;
}

function addRelation() {
    var valg = $('input:radio[name=praatleft]:checked').val();
    var valm = $('input:radio[name=praatmiddle]:checked').val();
    var vald = $('input:radio[name=praatright]:checked').val();
    if (!valg || !valm || !vald) {
        alert('Il faut choisir trois valeurs !');
        return;
    }
    var i = Number(valg.substr(1));
    var j = Number(vald.substr(1));
    if (i === j) {
        alert('Une relation ne peut pas être entre un tier et lui-même !');
        return;
    }
    var l = praat.names[i];
    var d = praat.names[j];
    var n = praat.relations.length;
    praat.relations.push( [l, valm, d] );
    $('#convert-praatrules').append('<p><span class="praatcommand">'
        + '<span class="rl">' + l + '</span>'
        + '<span class="rm">' + valm + '</span>'
        + '<span class="rd">' + d + '</span>'
        + '</span> <input type="button" value="Supprimer la relation" onclick="removeRelation(' + n + ');"/></p>');
    var paramsall = JSON.stringify(praat.relations);
    localStorage.setItem('paramsPraatRelations', paramsall);
}

function removeRelation(n) {
    n = Number(n);
    praat.relations[n] = null;
    displayRelation();
    var paramsall = JSON.stringify(praat.relations);
    localStorage.setItem('paramsPraatRelations', paramsall);
};

function displayRelation() {
    $('#convert-praatrules').html('');
    for (var i=0; i < praat.relations.length; i++) {
        if (!praat.relations[i]) continue;
        $('#convert-praatrules').append('<p><span class="praatcommand">'
            + '<span class="rl">' + praat.relations[i][0] + '</span>'
            + '<span class="rm">' + praat.relations[i][1] + '</span>'
            + '<span class="rd">' + praat.relations[i][2] + '</span>'
            + '</span> <input type="button" value="Supprimer la relation" onclick="removeRelation(' + i + ');"/></p>');
    }
};

function useTextgridOptions() {
    var val = $('input:checkbox[name=convert-praatoptions]').prop('checked');
    if (val)
        praat.options = true;
    else
        praat.options = false;
};

function computeParams() {
    var c = '-d ', i;
    for (i=0; i<praat.relations.length; i++) {
        if (!praat.relations[i]) continue;
        c += ' -t ' + praat.relations[i][0] + ' ' + praat.relations[i][1] + ' ' + praat.relations[i][2] + ' ';
    }
    return c;
};

function resetTextGrid() {
    praat.relations = [];
    var paramsall = JSON.stringify(praat.relations);
    localStorage.setItem('paramsPraatRelations', paramsall);
    $('#praatrules').html('');
}

function memorizeOptions() {
    localStorage.setItem('paramsPraatOptions', praat.options === true ? 'true' : 'false');
    /*
    var val = $('input:radio[name=paramdocx]:checked').val();
    localStorage.setItem('paramsDocxOptions', val);
    var val = $('input:radio[name=paramxlsx]:checked').val();
    localStorage.setItem('paramsXlsxOptions', val);
    val = $('input:radio[name=paramtxt]:checked').val();
    localStorage.setItem('paramsTxtOptions', val);
    val = $('input:radio[name=ajoutsuppr]:checked').val();
    localStorage.setItem('paramsTierOptions', val);
    val = $('#digitsdocx').val();
    localStorage.setItem('paramsDocxNumber', val);
    val = $('#digitsxlsx').val();
    localStorage.setItem('paramsXlsxNumber', val);
    val = $('#digitstxt').val();
    localStorage.setItem('paramsTxtNumber', val);
    val = $('input:checkbox[name=sectionlex]:checked').val();
    localStorage.setItem('paramsTxmSection', val);
    val = $('input:checkbox[name=rawline]:checked').val();
    localStorage.setItem('paramsTxmRawline', val);
    */
}
