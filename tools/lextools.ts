/**
 * create a lexicon teiml file from transcription teiml files
 * @author Christophe Parisse
 * @date june 2014
 */

import * as fs from 'fs';
import * as async from 'async';
import * as xpath from 'xpath';
import {DOMParser as dom} from 'xmldom';
import * as entities from 'entities';

//let dom = require('xmldom').DOMParser;
//let async = require('async');

//let parser = require('./parsesentence.js');
let clean = require('./cleansentence.js');

let xml2js = require('xml2js');

let symbols = {
	leftBracket: '⟪', // 27EA - '❮', // '⟨' 27E8 - '❬'
	rightBracket: '⟫', // 27EB - '❯', // '⟩' 27E9 - '❭' - 276C à 2771 ❬ ❭ ❮ ❯ ❰ ❱
	leftEvent: '⟦', // 27E6 - '『', // 300E - '⌈', // u2308
	rightEvent: '⟧', // 27E7 - '』', // 300F - '⌋', // u230b
	leftParent: '⁅', // 2045 // '⁘', // 2058 // '⁑' // 2051
	rightParent: '⁆', // 2046 // '⁘', // 2058
	leftCode: '⌜', // 231C - '⁌', // 204C // ▷ 25B7
	rightCode: '⌟', // 231F - '⁍', // 204D, // ◁ 25C1
};

let writeHeaderTEI = function(style:string, title:string, lang:any):string {
	let s = '';
	s += '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
	s += '<!DOCTYPE TEI SYSTEM "tei_speechTrans.dtd">\n';
	let l;
	if (typeof lang === 'string')
		l = lang;
	else
		l = lang.join(',');
	s += '<TEI version="0.2t" subversion="' + style + '" xmlns="http://www.tei-c.org/ns/1.0" xml:lang="' + l + '">\n';
	s += '<teiHeader>\n<fileDesc>\n';
	s += '</teiHeader>\n';
	s += '<text type="' + style + '">\n';
	return s;
};

let writeEndTEI = function():string {
	return '</text>\n</TEI>\n';
};

let writeHeaderHTML = function(style:string, title:string, lang:any):string {
	let s = '';
	s += '<!DOCTYPE html>';
	s += '<html>';
	s += '<head>';
	s += '<meta charset="UTF-8">';
	s += '<script src="lib/sorttable.js"></script>';
	s += '<link rel="stylesheet" type="text/css" href="css/tables.css">';
	s += '<link rel="stylesheet" type="text/css" href="css/display.css">';
	s += '<title>' + title + '</title>';
	s += '</head>';
	s += '<body>';
	s += style === 'kwic' ? '<h1>Concordances</h1>' : style === 'lex' ? 'Lexique' : 'Enoncés';
	s += '<h2>' + title + '</h2>';
	return s;
}

let writeHeaderDiv = function(style:string, title:string, lang:any):string {
	let s = '';
	s += '<div>';
	s += '<h3>' + (style === 'kwic' ? 'Kwic' : (style === 'lex' ? 'Lexique' : 'Enoncés')) + '</h3>';
	s += '<h4>' + title + '</h4>';
	return s;
}

let writeEndHTML = function():string {
	return '</body>\n</html>\n';
};

let writeEndDiv = function():string {
	return '</div>\n';
};

let cleanWithRepetition = function(s) {
//	s = s.replace(/\[\/\]/, "", "g");
//	s = s.replace(/\[\/\/\]/, "", "g");
//	s = s.replace(/\[\/\/\/\]/, "", "g");
//	s = s.replace(/\[\<\]/, "", "g");
//	s = s.replace(/\[\>\]/, "", "g");
	s = s.replace(/\[.*?\]/, "", "g");
	s = s.replace(/\x01/, "", "g");
	s = s.replace(/\x02/, "", "g");
	s = s.replace(/\x03/, "", "g");
	s = s.replace(/\x04/, "", "g");
	s = s.replace(/\x07/, "", "g");
	s = s.replace(/\x08/, "", "g");
	s = s.replace(/</, "", "g");
	s = s.replace(/>/, "", "g");
	s = s.replace(/\(\.\.\.\)/, "", "g");
	s = s.replace(/\(\.\.\)/, "", "g");
	s = s.replace(/\(\.\)/, "", "g");
	s = s.replace(/\+\,/, "", "g");
	s = s.replace(/\+\+/, "", "g");
	s = s.replace(/\+ /, "", "g");
	s = s.replace(/\(/, "", "g");
	s = s.replace(/\)/, "", "g");
	s = s.replace(/0/, "", "g");
	s = s.replace(/\t/ , "", "g");
	s = s.replace(/\*.*: /, "", "g");
	s = s.replace(/\s*/ , " ", "g");
	s = s.replace(/^\s*/ , "");
	s = s.replace(/\s*$/ , "");
	return s;
};

let cleanWithoutRepetition = function(s) {
	s = s.replace(/\[\/\]/, "", "g");
	s = s.replace(/\[\/\/\]/, "", "g");
	s = s.replace(/\[\/\/\/\]/, "", "g");
	s = s.replace(/\[\<\]/, "", "g");
	s = s.replace(/\[\>\]/, "", "g");
	s = s.replace(/\[.*?\]/, "", "g");
	s = s.replace(/\x01/, "", "g");
	s = s.replace(/\x02/, "", "g");
	s = s.replace(/\x03/, "", "g");
	s = s.replace(/\x04/, "", "g");
	s = s.replace(/\x07/, "", "g");
	s = s.replace(/\x08/, "", "g");
	s = s.replace(/</, "", "g");
	s = s.replace(/>/, "", "g");
	s = s.replace(/\(\.\.\.\)/, "", "g");
	s = s.replace(/\(\.\.\)/, "", "g");
	s = s.replace(/\(\.\)/, "", "g");
	s = s.replace(/\+\,/, "", "g");
	s = s.replace(/\+\+/, "", "g");
	s = s.replace(/\+ /, "", "g");
	s = s.replace(/\(/, "", "g");
	s = s.replace(/\)/, "", "g");
	s = s.replace(/0/, "", "g");
	s = s.replace(/\t/ , "", "g");
	s = s.replace(/\*.*: /, "", "g");
	s = s.replace(/\s*/ , " ", "g");
	s = s.replace(/^\s*/ , "");
	s = s.replace(/\s*$/ , "");
	return s;
};

let xsplit = function(s, sep) {
	let res = [];
	for (let i in s) {
		res = res.concat(s[i].split(sep));
	}
	return res;
};

let splitUtterance_v1 = function(u, filter:boolean) {
	//console.log(u);
	let cleanElt = /\&.*?\;/g;
	u = u.replace(cleanElt, ' ');
	let ch = [ filter ? cleanWithoutRepetition(u) :  cleanWithRepetition(u) ];
/*	ch.push('+...');
	ch.push('...');
	ch.push('+?.');
	ch.push('#!');
	ch.push('#.');
	let motif = '/(' + ch.join('|') + ')/';
	console.log(motif);
	let fullpcts = u.split(motif);
	//console.log(fullpcts);
*/
	let pcts = xsplit(ch, /([#.?!,;:]+)/ );
	//console.log(pcts);
	let wrds = xsplit(pcts, /\s+/);
	//console.log(wrds);
	let apos = xsplit(wrds, /(.*\')/);
	//console.log(apos);
	let res = [];
	for (let x in apos) { if (apos[x] !== ' ' && apos[x] !== '') res = res.concat(apos[x]); }
	return res;
};

let processUtteranceClan = function(u, line, filter) {
	try {
		u = entities.decodeHTML(u);
		let cleanElt = /&.*?;/g;
		u = u.replace(cleanElt, ' ');
		let r = clean.parse(u.trim());
		//console.log("CLAN: ", r);
		if (line === true) {
			if (filter === true) {
				return r.map((x) => {
					if (x[0].length < 1) return '';
					return x[0].substr(0,1) === '[' || x[0].substr(0,1) === symbols.leftEvent ? "" : x[0];
				}).join(' ');
			} else {
				return r.map((x) => x[0]).join(' ');
			}
		} else {
			if (filter === true) {
				return r.map((x) => {
					if (x[0].length < 1) return '';
					return x[0].substr(0,1) === '[' || x[0].substr(0,1) === symbols.leftEvent ? "" : x[0];
				});
			} else {
				return r.map((x) => x[0]);
			}
		}
	} catch(e) {
//		console.log('Process: ' + e.name + ': ' + e.found + ' at line: ' + e.line + ' pos: ' + e.offset + ' <[' + u + ']>');
		console.log('Process: ' + e + ' <[' + u + ']>');
		if (line === false) {
			return splitUtterance_v1(u.trim(), filter);
		} else {
			if (filter === true) {
				return cleanWithoutRepetition(u.trim());
			} else {
				return cleanWithRepetition(u.trim());
			}
		}
	}
};

let processUtterance = function(u, format, line, filter) {
	if (format === 'clan')
		return processUtteranceClan(u, line, filter);
	else 
		return processUtteranceNone(u, line, filter);
}

let processUtteranceNone = function(u, line, filter) {
	u = entities.decodeHTML(u);
	let r = u.replace(/<.*?>/g, '');
    r = r.replace(/\[.*?\]/g, '');
	//console.log("NONE: ", r);
	if (line === false) {
		return r.split(' ');
	} else {
		return r;
	}
}

let reStart = RegExp('start="(.*?)"');
let reEnd = RegExp('end="(.*?)"');
let reWho = RegExp('who="(.*?)"');
let reU = RegExp('<u>([^]*?)</u>', 'm');
let reSpanGrp = RegExp('<spanGrp type="([^]*?)">([^]*?)</spanGrp>', 'm');
let reSeg = RegExp('<seg>([^]*?)</seg>', 'm');
let reSpan = RegExp('<span>([^]*?)</span>', 'm');

/*
			if (TEI.ver === '0.2') {
				reSpan = RegExp('<spanGrp type="(.*?)">(.*?)</spanGrp>');
				reU = RegExp('<seg>(.*?)</seg>');
			} else if (TEI.ver === '0.3') {
				reSpan = RegExp('<span type="(.*?)">(.*?)</span>');
				reU = RegExp('<u>(.*?)</u>');
			} else if (TEI.ver === '0.2l' || TEI.ver === '0.4') {
				reSpan = RegExp('<span type="(.*?)">(.*?)</span>');
				reU = RegExp('<seg>(.*?)</seg>');
			}
*/

function getAllTags(t,re){
	let r = '';
	let p = 0;
	while (p < t.length) {
		let m = t.substr(p).match(re);
		if (!m) break;
		r = r + ' ' + m[1];
		p += m.index + m[0].length;
	}
	if (p === 0)	// in this case the pattern re was not found so we return the whole string
		return t;
	return r;
}

function tokenize(s) {
	return s.split(' ');
}

let parseString = function(s:string) {
	//console.log("parseString", s);
	let r:any = {};
	let v = s.match(reStart);
	r.start = (v) ? v[1] : '--';
	v = s.match(reEnd);
	r.end = (v) ? v[1] : '--';
	v = s.match(reWho);
	r.who = (v) ? v[1] : '--';
	
	r.u = '';
	v = s.match(reU);
	// console.log(v);
	if (v) {
		r.u = getAllTags(v[1],reSeg);
	}
	r.span = [];
	let p = 0;
	while (p < s.length) {
		let m = s.substr(p).match(reSpanGrp);
		if (!m) break;
		r.span.push({type: m[1], val: getAllTags(m[2], reSpan)});
		p += m.index + m[0].length;
	}
	//console.log(r);
	return r;
};

let __getAllWords = function(fn, field, pattern, all, nocase, callback) {
	if (!fs.existsSync(fn)) {
		console.log("file " + fn + " ignored: does not exist");
		return;
	}
	let re = null;
	if (pattern)
		try {
			if (nocase) {
				re = new RegExp(pattern, "i");
			} else {
				re = new RegExp(pattern);
			}
		} catch(e) {
			console.log('Erreur de motif de recherche (getAllWords: ' + fn + ') <' + pattern + '>');
			callback(1, 'Erreur de motif de recherche (getAllWords: ' + fn + ') <' + pattern + '>');
			return;
		}
	try {
		fs.readFile(fn, function(err, data) {
			// console.log(fn + ' ...');
			if (err || data === undefined) {
				console.log('error ' + err + '  on: ' + fn );
				callback(err, null, null);
				return;
			}
			let doc = new dom().parseFromString(data.toString(), 'text/xml');
			let TEI:any = {};
			let select = xpath.useNamespaces({"tei": "http://www.tei-c.org/ns/1.0", "xml": ""});
			TEI.ver = select("/tei:TEI/@version", doc).value;
			let p = select("/tei:TEI/@xml:lang", doc);
			if (p && p.length>0)
				TEI.lang = p[0].value;
			else
				TEI.lang = 'fra';
			//console.log(TEI.ver);
			p = select("//tei:transcriptionDesc/@ident", doc);
			let format;
			if (p && p.length>0)
				format = p[0].value;
			else
				format = 'none';
			//console.log("FORMAT1: ", format);
			let nodes = select("//tei:annotationBlock", doc);
			let utts = [];
			//console.log(nodes.length);
			for (let i=0; i<nodes.length; i++) {
				//console.log(i, nodes[i].toString());
				let s = parseString(nodes[i].toString());
				if (!fieldOk(s.who, field)) continue;
				s.u = (nocase===true) ? s.u.toLowerCase() : s.u;
				let w = processUtterance(s.u, format, true, all ? false : true);
				if (pattern) {
					let wf = [];
					for (let k in w) {
						if (w[k].search(re)>=0)
							wf.push(w[k]);
					}
					utts.push(wf);
				} else
					utts.push(w);
			}
			let wrds:any = {};
			for (let i in utts) {
				console.log(i, utts[i]);
				let ws = tokenize(utts[i]);
				for (let w in ws) {
					wrds[ws[w]] = (wrds[ws[w]] === undefined) ? 1 : wrds[ws[w]] + 1;
				}
			}
			callback(0, wrds, TEI);
		});
	} catch(err) {
		console.log("file " + fn + " ignored: " + err.toString());
		callback(1, "file " + fn + " ignored: " + err.toString());
	}
};

let getLeftContext = function(kwicNbWords, ulc, nodes, i) {
	if (ulc.length >= kwicNbWords) {
		return ulc.slice(ulc.length - kwicNbWords).join(' ');
	}
	let nb = ulc.length;
	let ret = ulc.join(' ');
	i--;
	while (nb < kwicNbWords && i >= 0) {
		let s = parseString(nodes[i].toString());
		let m = s.u.split(' ');
		if (m.length < kwicNbWords - nb) {
			ret = s.u + ' ' + ret;
			ret = '<loc>' + s.who + '</loc>' + ret;
			nb += m.length;
		} else {
			m = m.slice(m.length - (kwicNbWords - nb));
			ret = m.join(' ') + ' ' + ret;
			ret = '<loc>' + s.who + '</loc>' + ret;
		break;
		}
		i--;
	}
	return ret;
};

let getRightContext = function(kwicNbWords, ulc, nodes, i) {
	if (ulc.length >= kwicNbWords) {
		return ulc.slice(0,kwicNbWords).join(' ');
	}
	let nb = ulc.length;
	let ret = ulc.join(' ');
	i++;
	while (nb < kwicNbWords && i < nodes.length) {
		let s = parseString(nodes[i].toString());
		ret += '<loc>' + s.who + '</loc>';
		let m = s.u.split(' ');
		if (m.length < kwicNbWords - nb) {
			ret += ' ' + s.u;
			nb += m.length;
		} else {
			m = m.slice(0, kwicNbWords - nb);
			ret += ' ' + m.join(' ');
			break;
		}
		i++;
	}
	return ret;
};

let fieldOk = function(l, f) {
	if (!f || f.length === 0) return true;
	for (let i in f) {
		if ( l.indexOf(f[i]) >= 0) return true;
	}
	return false;
};

let findField = function(s, f, re) {
	if (!f || f.length === 0) return true;
	for (let j in s.span) {
		if (s.span[j].type.indexOf(f.substr(1)) === 0) {
			if (s.span[j].val.search(re)>=0) return true;
		}
	}
	return false;
};

let fieldOkSpan = function(s, f) {
	for (let p in f) {
		for (let j in s.span) {
			if (s.span[j].type.indexOf(f[p].substr(1)) === 0)
				return true;
		}
	}
	return false;
};

let __getPattern = function(fn, field, pattern, all, nocase, kwicNbWords, type, callback) {
	if (!fs.existsSync(fn)) {
		console.log("file " + fn + " ignored: does not exist");
		return;
	}
	// console.log(fn, field, pattern, all, nocase, kwicNbWords, type);
	// fn [] aller false false 1 kwic
	let re = null;
	if (pattern)
		try {
			if (nocase) {
				re = new RegExp(pattern, "i");
			} else {
				re = new RegExp(pattern);
			}
		} catch(e) {
			console.log('Erreur de motif de recherche (getPattern: ' + fn + ') <' + pattern + '>');
			callback(1, 'Erreur de motif de recherche (getAllWords: ' + fn + ') <' + pattern + '>', null);
			return;
		}
	try {
		fs.readFile( fn, function(err, data) {
			// console.log(fn + ' ...');
			let doc = new dom().parseFromString(data.toString(), 'text/xml');
			// console.log(doc);
			let select = xpath.useNamespaces({"tei": "http://www.tei-c.org/ns/1.0", "xml": ""});
			// console.log(select("/tei:TEI/@version", doc));
			let TEI:any = {};
			let p = select("/tei:TEI/@version", doc);
			if (p && p.value)
				TEI.ver = p.value;
			// let select = xpath.useNamespaces({"xml": ""});
			p = select("/tei:TEI/@xml:lang", doc);
			// console.log('langue:', p);
			if (p && p.length>0)
				TEI.lang = p[0].value;
			else
				TEI.lang = 'fra';
			p = select("//tei:transcriptionDesc/@ident", doc);
			let format;
			if (p && p.length>0)
				format = p[0].value;
			else
				format = 'none';
			//console.log("FORMAT2: ", format);
			let a = '//tei:when';
			let b = select(a, doc);
			let reWhen = RegExp('interval="(.*?)".*id="(.*?)"');
			let when = {};
			if (b) {
				for (let i=0; i<b.length; i++) {
//					console.log(b[i].toString());
					// <when interval="20.701" since="#T0" xml:id="T12"
					let m = b[i].toString().match(reWhen);
					if (m) {
//						console.log(m[1], m[2]);
						when[m[2]] = m[1];
					}
				}
			}
			let nodes = select("//tei:annotationBlock", doc);
			let utts = [];
			for (let i in field)
				if (field[i].substr(0,1) === '%') type = 'utterance';
			if (type === 'utterance' || (!pattern)) { // search is utterance oriented
				for (let i=0; i<nodes.length; i++) {
					let s = parseString(nodes[i].toString());
					if (!fieldOk(s.who, field) && !fieldOkSpan(s, field)) continue;
					s.u = (nocase===true) ? s.u.toLowerCase() : s.u;
					s.u = processUtterance(s.u, format, true, all ? false : true);
					if (pattern) {
						let found = false;
						for (let p in field) {
							if (field[p].substr(0,1) === '%') {
								if (findField(s, field[p], re)) {
									found = true;
									break;
								}
							} 
						}
						if (!found)
							if (s.u.search(re)<0) continue;
					}
					let startTime = when[s.start.substr(1)];
					let endTime = when[s.end.substr(1)];
					let v = '<tr class="lookentry">' + '<td onclick="aeec.call(\'' + fn.replace(/\\/g, '/') + '\',' + startTime + ')"><i class="fa fa-external-link"></i></td>'
						+ '<td class="file">' + fn.replace(/\\/g, '/') + '</td><td class="loc">' + s.who 
						+ '</td><td class="start">' + startTime + '</td><td class="end">' + endTime 
						+ '</td><td class="u">' + s.u + '</td><td>';
					for (let j in s.span) {
						v += '<span class="type">' + s.span[j].type + '</span><span class="val">' + s.span[j].val + '</span>';
					}
					v += '</td></tr>';
					utts.push( v );
				}
			} else { // search is word oriented
				for (let i=0; i<nodes.length; i++) {
					let s = parseString(nodes[i].toString());
					if (!fieldOk(s.who, field)) continue;
					//utts.push( '<loc>' + s.who + '</loc><start>' + s.start + '</start><end>' + s.end + '</end><u>' + u + '</u>' );
					s.u = (nocase===true) ? s.u.toLowerCase() : s.u;
//					console.log("Process: ", s.u, s);
					let wrds = processUtterance(s.u, format, false, all ? false : true);
					let startTime = when[s.start.substr(1)];
					let endTime = when[s.end.substr(1)];
//					console.log("WRDS:", wrds);
					for (let k=0; k<wrds.length; k++) {
						if (wrds[k].search(re) >= 0) {
							// extends the context for the kwic concordances
							let ulc = wrds.slice(0,k);
							let urc = wrds.slice(k+1);
							let lc = getLeftContext(kwicNbWords, ulc, nodes, i);
							let rc = getRightContext(kwicNbWords, urc, nodes, i);
//							let s = '<kwicEntry><file>' + fn + '</file><loc>' + s.who + '</loc><start>' + s.start + '</start><end>' + s.end + '</end>';
//							s += '<lc>' + lc + '</lc><kwic>' + wrds[k] + '</kwic><rc>' + rc + '</rc></kwicEntry>';
							let res = '<tr class="kwentry">' + '<td onclick="aeec.call(\'' + fn.replace(/\\/g, '/') + '\',' + startTime + ')"><i class="fa fa-external-link"></i></td>'
								+ '<td class="file">' + fn.replace(/\\/g, '/') + '</td><td class="loc">' + s.who 
								+ '</td><td class="start">' + startTime + '</td><td class="end">' + endTime + '</td>';
							res += '<td class="lc">' + lc + '</td><td class="kwic">' + wrds[k] + '</td><td class="rc">' + rc + '</td></tr>';
							utts.push(res);
						}
					}
				}
			}
			callback(0, utts, TEI);
		});
	} catch(err) {
		console.log("file " + fn + " ignored: " + err.toString());
		callback(1, "file " + fn + " ignored: " + err.toString());
	}
};

let __getDiv = function(fn, pattern, nocase, callback) {
	if (!fs.existsSync(fn)) {
		console.log("file " + fn + " ignored: does not exist");
		callback(1,"file " + fn + " ignored: does not exist");
		return;
	}
	let re = null;
	if (pattern)
		try {
			if (nocase) {
				re = new RegExp(pattern, "i");
			} else {
				re = new RegExp(pattern);
			}
		} catch(e) {
			console.log('Erreur de motif de recherche (getPatternRaw: ' + fn + ') <' + pattern + '>');
			callback(1, 'Erreur de motif de recherche (getPatternRaw: ' + fn + ') <' + pattern + '>');
			return;
		}
	try {
		fs.readFile( fn, function(err, data) {
			console.log(fn + ' ...');
			let doc = new dom().parseFromString(data.toString(), 'text/xml');
			let select = xpath.useNamespaces({"tei": "http://www.tei-c.org/ns/1.0", "xml": ""});
			let medialoc = select("//tei:recordingStmt/tei:recording/tei:media/@mediaLocation", doc);
			let medianame = select("//tei:recordingStmt/tei:recording/tei:media/@mediaName", doc);
			if (medialoc.length<1)
				medialoc = select("//tei:recordingStmt/tei:recording/tei:media/@url", doc);
			let nodes = select("//tei:div", doc);
			for (let i=0; i<nodes.length; i++) {
//				console.log(nodes[i].attributes);
				let start = "-1";
				let end = "-1";
				let type = '';
				for (let a in nodes[i].attributes) {
					if (nodes[i].attributes[a].localName === 'start')
						start = nodes[i].attributes[a].value;
					if (nodes[i].attributes[a].localName === 'end')
						end = nodes[i].attributes[a].value;
					if (nodes[i].attributes[a].localName === 'type')
						type = nodes[i].attributes[a].value;
//					console.log('Name: ' + nodes[i].attributes[a].localName);
//					console.log('Value: ' + nodes[i].attributes[a].value);
				}
				if (type.indexOf('(private)') >= 0) {
					let a = "//tei:when[@xml:id='"+start.substring(1)+"']/@interval";
					let startTime = select(a, doc);
					a = "//tei:when[@xml:id='"+end.substring(1)+"']/@interval";
					let endTime = select(a, doc);
					console.log('--> ' + type + ' ' + startTime[0].value + ' ' + endTime[0].value);
					console.log('--> ' + medialoc + ' ' + medianame);
					for (let n=0; n<medialoc.length; n++) {
						let fmed = medialoc[n].value;
						if (n<medianame.length && medianame[n]) {
							fmed += '/' + medianame[n].value;
						}
						if (fmed.indexOf('file://') === 0)
							fmed = fmed.substr(7);
						console.log("media: "+n+' '+fmed);
					}
				}
			}		
			callback(0, '');
		});
	} catch(err) {
		console.log("file " + fn + " ignored: " + err.toString());
		callback(1, "file " + fn + " ignored: " + err.toString());
	}
};

/**
 * more general function to get all the utterances from a file or group of files
 * #method: tools.getPattern
 * @param {Object} files : array of filenames
 * @param {String} pattern : allow to filler the words wanted
 * @param {String} param : use all utterances or only transcription + diff nodiff case
 * #param {int} kwicNbWords : size of context to display
 * @param {Object} toolsCallback
 */
export function getDiv(files, pattern, param, toolsCallback) {
	let resultatGlobal = [];
	let nocase = false; // consider lower and upper case as different
	if (param.indexOf('i') !== -1) nocase = true;
	async.eachSeries(files, function(item, callback) {
		__getDiv(item, pattern, nocase, function(err, data) {
				if (!err) {
					resultatGlobal = resultatGlobal.concat(data);
				}
				callback();
			});
		}, function(err) {
			if (err) {
				// One of the iterations produced an error.
				// All processing will now stop.
				//console.log('A file failed to process');
				toolsCallback(err, null);
			} else {
				//console.log('All files have been processed successfully');
				//console.log(resultatGlobal);
				toolsCallback(err, resultatGlobal.join('\n'));
			}
	});
};

export function Div(files, pattern, params, output, callback) {
	getDiv(files, pattern, params, function(err, data) {
		if (err) {
			console.log('cannot process div query ' + files + ' ' + pattern + ' ' + params);
			callback(1, 'cannot process div query ' + files + ' ' + pattern + ' ' + params);
		}
		else {
			try {
				fs.writeFile(output, data, callback);
			} catch (e) {
				console.log('cannot write result to file ' + output + ' : ' + e.toString());
				callback(1, 'cannot write result to file ' + output + ' : ' + e.toString());
			}
		}		
	});
};

function concatlexicon(lex, list) {
	for (let w in list) {
		lex[w] = (lex[w] === undefined) ? list[w] : lex[w] + list[w];
	}
}

function arrayToTable(list) {
	let table = {};
	for (let m in list) {
		if (typeof list[m] === 'string') {
			let v = table[list[m]];
			table[list[m]] = (v===undefined) ? 1 : (v+1);
		} else {
			let l1 = list[m];
			for (let m1 in l1) {
				let v = table[l1[m1]];
				table[l1[m1]] = (v===undefined) ? 1 : (v+1);
			}
		}
	}
	return table;
};

/**
 * more general function to get all the words from a file or group of files
 * #method: tools.getLexicon
 * @param {Object} files : array of filenames
 * @param {Object} pattern : allow to filler the words wanted
 * @param {Object} param : use all utterances or only transcription + diff nodiff case
 * @param {Object} toolsCallback
 */
export function getLexicon(files, field, pattern, param, toolsCallback) {
	let resultatGlobal:any = {};
	let TEIGlobal:any = {};
	TEIGlobal.lang = [];
	let all = false; // use only content of utterances
	let nocase = false; // consider lower and upper case as different 
	if (param.indexOf('!a!') !== -1) all = true;
	if (param.indexOf('!i!') !== -1) nocase = true;
	async.eachSeries(files, function(item, callback) {
		__getAllWords(item, field, pattern, all, nocase, function(err, data, TEI) {
				if (!err) {
					concatlexicon(resultatGlobal, data);
					if ( TEIGlobal.lang.indexOf(TEI.lang) < 0 ) TEIGlobal.lang.push(TEI.lang);
				}
				callback();
			});
		},
		function(err) {
			if (err) {
				// One of the iterations produced an error.
				// All processing will now stop.
				//console.log('A file failed to process');
				toolsCallback(err, null);
			} else {
				//console.log('All files have been processed successfully');
				//console.log(resultatGlobal);
				// let l1 = 'lexicon' + (field?field:"-") + (pattern?pattern:"-") + (param?param:"-");
				let title = Date();
				let l = (param.indexOf('!div!') !== -1)
					? writeHeaderDiv('lex', title, TEIGlobal.lang)
					: writeHeaderHTML('lex', title, TEIGlobal.lang);
				l += '<table class="lex pure-table sortable"><thead><td>Mot</td><td>Nb Occurrences</td></thead>';
				for (let k in resultatGlobal)
				//	l += '<lexEntry val="' + k + '" count="' + lx[k] + '"/>\n';
					l += '<tr><td class="word">' + k + '</td><td class="count">' + resultatGlobal[k] + '</td></tr>\n';
				l += '</table>';
				l += (param.indexOf('!div!') !== -1) ? writeEndDiv() : writeEndHTML();
				toolsCallback(err, l);
			}
	});
};

/**
 * more general function to get all the utterances from a file or group of files
 * #method: tools.getPattern
 * @param {Object} files : array of filenames
 * @param {String} pattern : allow to filler the words wanted
 * @param {String} param : use all utterances or only transcription + diff nodiff case
 * #param {int} kwicNbWords : size of context to display
 * @param {Object} toolsCallback
 */
export function getPattern(files, field, pattern, param, kwicNbWords, toolsCallback) {
	let resultatGlobal = [];
	let TEIGlobal:any = {};
	TEIGlobal.lang = [];
	let all = false; // use only content of utterances
	let nocase = false; // consider lower and upper case as different
	let type = 'kwic'; // default kwic concordances
	if (param.indexOf('a') !== -1) all = true;
	if (param.indexOf('i') !== -1) nocase = true;
	if (param.indexOf('u') !== -1) type = 'utterance';
	async.eachSeries(files, function(item, callback) {
		__getPattern(item, field, pattern, all, nocase, kwicNbWords, type, function(err, data, TEI) {
				if (!err) {
					resultatGlobal = resultatGlobal.concat(data);
					if ( TEIGlobal.lang.indexOf(TEI.lang) < 0 ) TEIGlobal.lang.push(TEI.lang);
				}
				callback();
			});
		}, 
		function(err) {
			if (err) {
				// One of the iterations produced an error.
				// All processing will now stop.
				//console.log('A file failed to process');
				toolsCallback(err, null);
			} else {
				//console.log('All files have been processed successfully');
				//console.log(resultatGlobal);
				let name = type === 'kwic' ? 'kwic' : 'utterance';
				let title = Date();
				let l = (param.indexOf('!div!') !== -1)
					? writeHeaderDiv(name, title, TEIGlobal.lang)
					: writeHeaderHTML(name, title, TEIGlobal.lang);
				l += '<table class="' + type + ' pure-table sortable">';
				if (type === 'kwic') {
					l += '<thead class="kwichead"><td></td><td class="file">Fichier</td><td class="loc">Locuteur</td><td class="start">Début</td><td class="end">Fin</td>';
					l += '<td class="lc">Gauche</td><td class="kwic">Mot</td><td class="rc">Droite</td></thead>';
				} else {
					l += '<thead class="lookhead"><td></td><td class="file">Fichier</td><td class="loc">Locuteur</td><td class="start">Début</td><td class="end">Fin</td><td class="u">Enoncé</td><td>Contexte</td></thead>';
				}
				l += resultatGlobal.join('\n');
				l += '</table>';
				l += (param.indexOf('!div!') !== -1) ? writeEndDiv() : writeEndHTML();
				toolsCallback(err, l);
			}
	});
};

export function Kwic(files, field, pattern, params, kwic, output, callback) {
	getPattern(files, field, pattern, params, kwic, function(err, data) {
		if (err) {
			console.log('cannot process query ' + files + ' ' + field + ' ' + pattern + ' ' + params + ' ' + kwic);
			callback(1, 'cannot process query ' + files + ' ' + field + ' ' + pattern + ' ' + params + ' ' + kwic);
		} else {
			try {
				fs.writeFile(output, data, callback);
			} catch (e) {
				console.log('cannot write result to file ' + output + ' : ' + e.toString());
				callback(1, 'cannot write result to file ' + output + ' : ' + e.toString());
			}
		}		
	});
};

export function Lexicon(files, field, pattern, params, output, callback) {
	getLexicon(files, field, pattern, params, function(err, data) {
		if (err) {
			console.log('cannot process query ' + files + ' ' + field + ' ' + pattern + ' ' + params);
			callback(1, 'cannot process query ' + files + ' ' + field + ' ' + pattern + ' ' + params);
		} else {
			try {
				fs.writeFile(output, data, callback);
			} catch (e) {
				console.log('cannot write result to file ' + output + ' : ' + e.toString());
				callback(1, 'cannot write result to file ' + output + ' : ' + e.toString());
			}
		}
	});
};
