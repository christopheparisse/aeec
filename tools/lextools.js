/**
 * create a lexicon teiml file from transcription teiml files
 * @author Christophe Parisse
 * @date june 2014
 */

var fs = require('fs');
var async = require('async');
var xpath = require('xpath');
var dom = require('xmldom').DOMParser;
// var parser = require('./parsesentence.js');
var clean = require('./cleansentence.js');

var xml2js = require('xml2js');

var tools = exports;

var symbols = {
	leftBracket: '⟪', // 27EA - '❮', // '⟨' 27E8 - '❬'
	rightBracket: '⟫', // 27EB - '❯', // '⟩' 27E9 - '❭' - 276C à 2771 ❬ ❭ ❮ ❯ ❰ ❱
	leftEvent: '⟦', // 27E6 - '『', // 300E - '⌈', // u2308
	rightEvent: '⟧', // 27E7 - '』', // 300F - '⌋', // u230b
	leftParent: '⁅', // 2045 // '⁘', // 2058 // '⁑' // 2051
	rightParent: '⁆', // 2046 // '⁘', // 2058
	leftCode: '⌜', // 231C - '⁌', // 204C // ▷ 25B7
	rightCode: '⌟', // 231F - '⁍', // 204D, // ◁ 25C1
};

var writeHeaderTEI = function(style, title, lang) {
	var s = '';
	s += '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
	s += '<!DOCTYPE TEI SYSTEM "tei_speechTrans.dtd">\n';
	var l;
	if (typeof lang === 'string')
		l = lang;
	else
		l = lang.join(',');
	s += '<TEI version="0.2t" subversion="' + style + '" xmlns="http://www.tei-c.org/ns/1.0" xml:lang="' + l + '">\n';
	s += '<teiHeader>\n<fileDesc>\n';

	s += '<notesStmt><metadata type="dc">\n';
    s += '<note property="Title" info="Titre du document">' + title + '</note>\n';
    s += '<note property="Creator" info="Créateur du document">transcriber.js</note>\n';
    s += '<note property="Subject" info="Sujet et mots-clefs">Automatically generated by transcriberjs</note>\n';
    s += '<note property="Description" info="Description du document">' + style + '</note>\n';
    s += '<note property="Publisher" info="Publicateur du document">Modyco/Ortolang/DGLFLF</note>\n';
    s += '<note property="Contributor" info="Contributeur au document">transcriber.js</note>\n';
    s += '<note property="Type" info="Nature ou genre du contenu">Automatically generated</note>\n';
    s += '<note property="Format" info="Format du document">teiml-' + style + '-0.1</note>\n';
    s += '<note property="Date">' + Date() + '</note>';
    s += '<note property="Identifier" info="Identificateur non ambigu">' + style + Date.now() + '</note>\n';
    s += '<note property="Source" info="Ressource dont dérive le document">transcriber.js</note>\n';
    s += '<note property="Language" info="Langue du document">' + lang + '</note>\n';
    s += '<note property="Rights" info="Droits relatifs à la ressource">Free</note>\n';
	s += '</metadata>\n';
	s += '</notesStmt>\n</fileDesc>\n';
/*
	
	s += '<profileDesc>\n';
	s += '<particDesc>\n';

	table = $("#participant");
	tablelines = $('tr', table[0]);
	for (var i = 1; i < tablelines.length; i++) {
		var icode = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 0));
		var iid = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 1));
		var iname = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 2));
		var iage = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 3));
		var irol = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 4));
		var isex = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 5));
		var ilg = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 6));
		var igrp = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 7));
		var ises = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 8));
		var ieduc = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 9));
		var isrc = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 10));
		var icust = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 11));
		if (icode=='' && iid==='' && iname==='' && iage=='') continue;

		s += '<person code="' + trjs.editor.notnull(icode) + '"\n';
		if (trjs.transcription.isnotbl(iid)) s += 'xml:id="' + iid + '"\n';
		if (trjs.transcription.isnotbl(iname)) s += 'name="' + iname + '"\n';
		if (trjs.transcription.isnotbl(iage)) s += 'age="' + iage + '"\n';
		if (trjs.transcription.isnotbl(irol)) s += 'role="' + irol + '"\n';
		if (trjs.transcription.isnotbl(isex)) s += 'sex="' + isex + '"\n';
		if (trjs.transcription.isnotbl(ilg)) s += 'xml:lang="' + ilg + '"\n';
		if (trjs.transcription.isnotbl(isrc)) s += 'source="' + isrc + '"\n';
		s += '>\n';
		if (trjs.transcription.isnotbl(ises)) s += '<socecStatus>' + ises + '</socecStatus>\n';
		if (trjs.transcription.isnotbl(ieduc)) s += '<education>' + ieduc + '</education>\n';
		if (trjs.transcription.isnotbl(igrp) && trjs.transcription.isnotbl(icust)) {
			s += '<note \n';
			if (trjs.transcription.isnotbl(igrp)) s += 'group="' + igrp + '"\n';
			if (trjs.transcription.isnotbl(icust)) s += 'customField="' + icust + '"\n';
			s+= ' />\n';
		}
		s += '</person>';
	}
	s += '</particDesc>\n</profileDesc>\n';

	s += '<revisionDesc>\n';
	var d = new Date();
	s += '<revision>last save: ' + d.toString() + '</revision>\n';
	s += '</revisionDesc>\n';

	s += '<templateDesc>\n';
	table = $("#template");
	tablelines = $('tr', table[0]);
	for (var i = 1; i < tablelines.length; i++) {
		var icode = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 0));
		var itype = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 1));
		var ipar = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 2));
		var idesc = trjs.transcription.checkstring(trjs.events.lineGetCell( $(tablelines[i]), 3));
		if (icode=='' && itype==='' && ipar==='' && idesc=='') continue;
		s += '<template code="' + icode + '"\n';
		s += 'type="' + itype + '"\n';
		s += 'parent="' + ipar + '">' + idesc + '</template>\n';
	}
	s += '</templateDesc>\n';
*/

	s += '</teiHeader>\n';
	
	s += '<text type="' + style + '">\n';
	return s;
};

var writeEndTEI = function() {
	return '</text>\n</TEI>\n';
};


var writeHeaderHTML = function(style, title, lang) {
	var s = '';
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

var writeEndHTML = function() {
	return '</body>\n</html>\n';
};

var cleanWithRepetition = function(s) {
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

var cleanWithoutRepetition = function(s) {
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

var xsplit = function(s, sep) {
	var res = [];
	for (i in s) {
		res = res.concat(s[i].split(sep));
	}
	return res;
};

var splitUtterance_v1 = function(u, filter) {
	//console.log(u);
	var cleanElt = /\&.*?\;/g;
	u = u.replace(cleanElt, ' ');
	var ch = [ filter ? cleanWithoutRepetition(u) :  cleanWithRepetition(u) ];
/*	ch.push('+...');
	ch.push('...');
	ch.push('+?.');
	ch.push('#!');
	ch.push('#.');
	var motif = '/(' + ch.join('|') + ')/';
	console.log(motif);
	var fullpcts = u.split(motif);
	//console.log(fullpcts);
*/
	var pcts = xsplit(ch, /([#.?!,;:]+)/ );
	//console.log(pcts);
	var wrds = xsplit(pcts, /\s+/);
	//console.log(wrds);
	var apos = xsplit(wrds, /(.*\')/);
	//console.log(apos);
	var res = [];
	for (x in apos) { if (apos[x] !== ' ' && apos[x] !== '') res = res.concat(apos[x]); }
	return res;
};

var processUtterance = function(u, line, filter) {
	try {
		var cleanElt = /\&.*?\;/g;
		u = u.replace(cleanElt, ' ');
		var r = clean.parse(u.trim());
//		console.log("CLEAN", u, r);
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

var reStart = RegExp('start="(.*?)"');
var reEnd = RegExp('end="(.*?)"');
var reWho = RegExp('who="(.*?)"');
var reU = RegExp('<u>([^]*?)</u>', 'm');
var reSpanGrp = RegExp('<spanGrp type="([^]*?)">([^]*?)</spanGrp>', 'm');
var reSeg = RegExp('<seg>([^]*?)</seg>', 'm');
var reSpan = RegExp('<span>([^]*?)</span>', 'm');

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
	var r = '';
	var p = 0;
	while (p < t.length) {
		var m = t.substr(p).match(re);
		if (!m) break;
		r = r + ' ' + m[1];
		p += m.index + m[0].length;
	}
	if (p === 0)	// in this case the pattern re was not found so we return the whole string
		return t;
	return r;
}


var parseString = function(s) {
	// console.log("parseString", s);
	var r = {};
	var v = s.match(reStart);
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
	var p = 0;
	while (p < s.length) {
		var m = s.substr(p).match(reSpanGrp);
		if (!m) break;
		r.span.push({type: m[1], val: getAllTags(m[2], reSpan)});
		p += m.index + m[0].length;
	}
	// console.log(r);
	return r;
};

var __getAllWords = function(fn, field, pattern, all, nocase, callback) {
	if (!fs.existsSync(fn)) {
		console.log("file " + fn + " ignored: does not exist");
		return;
	}
	var re = null;
	if (pattern)
		try {
			if (nocase) {
				re = new RegExp(pattern, "i");
			} else {
				re = new RegExp(pattern);
			}
		} catch(e) {
			console.log('Erreur de motif de recherche (getAllWords: ' + fn + ') <' + pattern + '>');
			return;
		}
	try {
		fs.readFile( fn, function(err, data) {
			// console.log(fn + ' ...');
			if (err>0 || data === undefined) {
				console.log('error ' + err + '  on: ' + fn );
				callback(err, null, null);
				return;
			}
			var doc = new dom().parseFromString(data.toString(), 'text/xml');
			var TEI = {};
			var select = xpath.useNamespaces({"tei": "http://www.tei-c.org/ns/1.0", "xml": ""});
			TEI.ver = select("/tei:TEI/@version", doc).value;
			var p = select("/tei:TEI/@xml:lang", doc);
			if (p && p.length>0)
				TEI.lang = p[0].value;
			else
				TEI.lang = 'fra';
			//console.log(TEI.ver);
			var nodes = select("//tei:annotationBlock", doc);
			var utts = [];
			for (var i=0; i<nodes.length; i++) {
				var s = parseString(nodes[i].toString());
				if (!fieldOk(s.who, field)) continue;
				s.u = (nocase===true) ? s.u.toLowerCase() : s.u;
				var w = processUtterance(s.u, true, all ? false : true);
				if (pattern) {
					var wf = [];
					for (var k in w) {
						if (w[k].search(re)>=0)
							wf.push(w[k]);
					}
					utts.push(wf);
				} else
					utts.push(w);
	/*
	//			console.log(s.span);
				var v = '<file>' + fn + '</file><loc>' + s.who + '</loc><start>' + s.start + '</start><end>' + s.end + '</end><u>' + s.u + '</u>';
				for (var j in s.span) {
					v += '<span><type>' + s.span[j].type + '</type><val>' + s.span[j].val + '</val></span>';
				}
				utts.push( v );
	*/
				// console.log(utts);
			}
			for (var i=0; i<nodes.length; i++)
				if (nodes[i].firstChild) {
					if (nodes[i].firstChild.data) {
						var w = nodes[i].firstChild.data;
						// nodes[i].localName
						// nodes[i].toString()
					}
				}
			callback(0, utts, TEI);
		});
	} catch(err) {
		console.log("file " + fn + " ignored: " + err.toString());
	}
};

var getLeftContext = function(kwicNbWords, ulc, nodes, i) {
	if (ulc.length >= kwicNbWords) {
		return ulc.slice(ulc.length - kwicNbWords).join(' ');
	}
	var nb = ulc.length;
	var ret = ulc.join(' ');
	i--;
	while (nb < kwicNbWords && i >= 0) {
		var s = parseString(nodes[i].toString());
		var m = s.u.split(' ');
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

var getRightContext = function(kwicNbWords, ulc, nodes, i) {
	if (ulc.length >= kwicNbWords) {
		return ulc.slice(0,kwicNbWords).join(' ');
	}
	var nb = ulc.length;
	var ret = ulc.join(' ');
	i++;
	while (nb < kwicNbWords && i < nodes.length) {
		var s = parseString(nodes[i].toString());
		ret += '<loc>' + s.who + '</loc>';
		var m = s.u.split(' ');
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

var fieldOk = function(l, f) {
	if (!f || f.length === 0) return true;
	for (i in f) {
		if ( l.indexOf(f[i]) >= 0) return true;
	}
	return false;
};

var findField = function(s, f, re) {
	if (!f || f.length === 0) return true;
	for (var j in s.span) {
		if (s.span[j].type.indexOf(f.substr(1)) === 0) {
			if (s.span[j].val.search(re)>=0) return true;
		}
	}
	return false;
};

var fieldOkSpan = function(s, f) {
	for (var p in f) {
		for (var j in s.span) {
			if (s.span[j].type.indexOf(f[p].substr(1)) === 0)
				return true;
		}
	}
	return false;
};

var __getPattern = function(fn, field, pattern, all, nocase, kwicNbWords, type, callback) {
	if (!fs.existsSync(fn)) {
		console.log("file " + fn + " ignored: does not exist");
		return;
	}
	// console.log(fn, field, pattern, all, nocase, kwicNbWords, type);
	// fn [] aller false false 1 kwic
	var re = null;
	if (pattern)
		try {
			if (nocase) {
				re = new RegExp(pattern, "i");
			} else {
				re = new RegExp(pattern);
			}
		} catch(e) {
			console.log('Erreur de motif de recherche (getPattern: ' + fn + ') <' + pattern + '>');
			return;
		}
	try {
		fs.readFile( fn, function(err, data) {
			// console.log(fn + ' ...');
			var doc = new dom().parseFromString(data.toString(), 'text/xml');
			// console.log(doc);
			var select = xpath.useNamespaces({"tei": "http://www.tei-c.org/ns/1.0", "xml": ""});
			// console.log(select("/tei:TEI/@version", doc));
			var TEI = {};
			var p = select("/tei:TEI/@version", doc);
			if (p && p.value)
				TEI.ver = p.value;
			// var select = xpath.useNamespaces({"xml": ""});
			p = select("/tei:TEI/@xml:lang", doc);
			// console.log('langue:', p);
			if (p && p.length>0)
				TEI.lang = p[0].value;
			else
				TEI.lang = 'fra';
			var a = '//tei:when';
			var b = select(a, doc);
			var reWhen = RegExp('interval="(.*?)".*id="(.*?)"');
			var when = {};
			if (b) {
				for (var i=0; i<b.length; i++) {
//					console.log(b[i].toString());
					// <when interval="20.701" since="#T0" xml:id="T12"
					var m = b[i].toString().match(reWhen);
					if (m) {
//						console.log(m[1], m[2]);
						when[m[2]] = m[1];
					}
				}
			}
			var nodes = select("//tei:annotationBlock", doc);
			var utts = [];
			for (var i in field)
				if (field[i].substr(0,1) === '%') type = 'u';
			if (type === 'utterance' || (!pattern)) { // search is utterance oriented
				for (var i=0; i<nodes.length; i++) {
					var s = parseString(nodes[i].toString());
					if (!fieldOk(s.who, field) && !fieldOkSpan(s, field)) continue;
					s.u = (nocase===true) ? s.u.toLowerCase() : s.u;
					s.u = processUtterance(s.u, true, all ? false : true);
					if (pattern) {
						var found = false;
						for (var p in field) {
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
					var startTime = when[s.start.substr(1)];
					var endTime = when[s.end.substr(1)];
					var v = '<tr class="lookentry"><td class="file">' + fn + '</td><td class="loc">' + s.who + '</td><td class="start">' + startTime + '</td><td class="end">' + endTime + '</td><td class="u">' + s.u + '</td><td>';
					for (var j in s.span) {
						v += '<span class="type">' + s.span[j].type + '</span><span class="val">' + s.span[j].val + '</span>';
					}
					v += '</td></tr>';
					utts.push( v );
				}
			} else { // search is word oriented
				for (var i=0; i<nodes.length; i++) {
					var s = parseString(nodes[i].toString());
					if (!fieldOk(s.who, field)) continue;
					//utts.push( '<loc>' + s.who + '</loc><start>' + s.start + '</start><end>' + s.end + '</end><u>' + u + '</u>' );
					s.u = (nocase===true) ? s.u.toLowerCase() : s.u;
//					console.log("Process: ", s.u, s);
					var wrds = processUtterance(s.u, false, all ? false : true);
					var startTime = when[s.start.substr(1)];
					var endTime = when[s.end.substr(1)];
//					console.log("WRDS:", wrds);
					for (var k=0; k<wrds.length; k++) {
						if (wrds[k].search(re) >= 0) {
							// extends the context for the kwic concordances
							var ulc = wrds.slice(0,k);
							var urc = wrds.slice(k+1);
							var lc = getLeftContext(kwicNbWords, ulc, nodes, i);
							var rc = getRightContext(kwicNbWords, urc, nodes, i);
//							var s = '<kwicEntry><file>' + fn + '</file><loc>' + s.who + '</loc><start>' + s.start + '</start><end>' + s.end + '</end>';
//							s += '<lc>' + lc + '</lc><kwic>' + wrds[k] + '</kwic><rc>' + rc + '</rc></kwicEntry>';
							var s = '<tr class="kwentry"><td class="file">' + fn + '</td><td class="loc">' + s.who + '</td><td class="start">' + startTime + '</td><td class="end">' + endTime + '</td>';
							s += '<td class="lc">' + lc + '</td><td class="kwic">' + wrds[k] + '</td><td class="rc">' + rc + '</td></tr>';
							utts.push(s);
						}
					}
				}
			}
			callback(0, utts, TEI);
		});
	} catch(err) {
		console.log("file " + fn + " ignored: " + err.toString());
	}
};

var __getDiv = function(fn, pattern, nocase, callback) {
	if (!fs.existsSync(fn)) {
		console.log("file " + fn + " ignored: does not exist");
		return;
	}
	var re = null;
	if (pattern)
		try {
			if (nocase) {
				re = new RegExp(pattern, "i");
			} else {
				re = new RegExp(pattern);
			}
		} catch(e) {
			console.log('Erreur de motif de recherche (getPatternRaw: ' + fn + ') <' + pattern + '>');
			return;
		}
	try {
		fs.readFile( fn, function(err, data) {
			console.log(fn + ' ...');
			var doc = new dom().parseFromString(data.toString(), 'text/xml');
			var select = xpath.useNamespaces({"tei": "http://www.tei-c.org/ns/1.0", "xml": ""});
			var medialoc = select("//tei:recordingStmt/tei:recording/tei:media/@mediaLocation", doc);
			var medianame = select("//tei:recordingStmt/tei:recording/tei:media/@mediaName", doc);
			if (medialoc.length<1)
				medialoc = select("//tei:recordingStmt/tei:recording/tei:media/@url", doc);
			var nodes = select("//tei:div", doc);
			for (var i=0; i<nodes.length; i++) {
//				console.log(nodes[i].attributes);
				var start = -1;
				var end = -1;
				var type = '';
				for (var a in nodes[i].attributes) {
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
					var a = "//tei:when[@xml:id='"+start.substring(1)+"']/@interval";
					var startTime = select(a, doc);
					a = "//tei:when[@xml:id='"+end.substring(1)+"']/@interval";
					var endTime = select(a, doc);
					console.log('--> ' + type + ' ' + startTime[0].value + ' ' + endTime[0].value);
					console.log('--> ' + medialoc + ' ' + medianame);
					for (var n=0; n<medialoc.length; n++) {
						var fmed = medialoc[n].value;
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
tools.getDiv = function(files, pattern, param, toolsCallback) {
	var resultatGlobal = [];
	var nocase = false; // consider lower and upper case as different
	if (param.indexOf('i') !== -1) nocase = true;
	async.eachSeries(files, function(item, callback) {
		__getDiv(item, pattern, nocase, function(err, data) {
				if (err===0) {
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

tools.Div = function(files, pattern, params, output, callback) {
	tools.getDiv(files, pattern, params, function(err, data) {
		if (err)
			console.log('cannot process div query ' + files + ' ' + pattern + ' ' + params);
		else {
			try {
				fs.writeFile(output, data, callback);
			} catch (e) {
				console.log('cannot write result to file ' + output + ' : ' + e.toString());
			}
		}		
	});
};

tools.arrayToTable = function(list) {
	var table = {};
	for (m in list) {
		if (typeof list[m] === 'string') {
			var v = table[list[m]];
			table[list[m]] = (v===undefined) ? 1 : (v+1);
		} else {
			var l1 = list[m];
			for (m1 in l1) {
				var v = table[l1[m1]];
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
tools.getLexicon = function(files, field, pattern, param, toolsCallback) {
	var resultatGlobal = [];
	var TEIGlobal = {};
	TEIGlobal.lang = [];
	var all = false; // use only content of utterances
	var nocase = false; // consider lower and upper case as different 
	if (param.indexOf('!all!') !== -1) all = true;
	if (param.indexOf('!i!') !== -1) nocase = true;
	async.eachSeries(files, function(item, callback) {
		__getAllWords(item, field, pattern, all, nocase, function(err, data, TEI) {
				if (err===0) {
					resultatGlobal = resultatGlobal.concat(data);
					if ( TEIGlobal.lang.indexOf(TEI.lang) < 0 ) TEIGlobal.lang.push(TEI.lang);
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
				var lx = 'lexicon' + (field?field:"-") + (pattern?pattern:"-") + (param?param:"-");
				var l = writeHeaderHTML('lexicon', lx, TEIGlobal.lang);
				var lx = tools.arrayToTable(resultatGlobal);
				l += '<table class="lex pure-table sortable"><thead><td>Mot</td><td>Nb Occurrences</td></thead>';
				for (k in lx)
				//	l += '<lexEntry val="' + k + '" count="' + lx[k] + '"/>\n';
					l += '<tr><td class="word">' + k + '</td><td class="count">' + lx[k] + '</td></tr>\n';
				l += '</table>';
				l += writeEndHTML();
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
tools.getPattern = function(files, field, pattern, param, kwicNbWords, toolsCallback) {
	var resultatGlobal = [];
	var TEIGlobal = {};
	TEIGlobal.lang = [];
	var all = false; // use only content of utterances
	var nocase = false; // consider lower and upper case as different
	var type = 'kwic'; // default kwic concordances
	if (param.indexOf('a') !== -1) all = true;
	if (param.indexOf('i') !== -1) nocase = true;
	if (param.indexOf('u') !== -1) type = 'utterance';
	async.eachSeries(files, function(item, callback) {
		__getPattern(item, field, pattern, all, nocase, kwicNbWords, type, function(err, data, TEI) {
				if (err===0) {
					resultatGlobal = resultatGlobal.concat(data);
					if ( TEIGlobal.lang.indexOf(TEI.lang) < 0 ) TEIGlobal.lang.push(TEI.lang);
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
				var name = type === 'kwic' ? 'kwic' : 'utterance';
				var title = (type === 'kwic' ? 'Concordances' : 'Utterances') + ' ' + Date()  + ' - Paramètres: (' + field  + ' ' + pattern  + ' ' + param + ')';
				var l = writeHeaderHTML(name, title, TEIGlobal.lang);
				l += '<table class="' + type + ' pure-table sortable">';
				if (type === 'kwic') {
					l += '<thead class="kwichead"><td class="file">Fichier</td><td class="loc">Locuteur</td><td class="start">Début</td><td class="end">Fin</td>';
					l += '<td class="lc">Gauche</td><td class="kwic">Mot</td><td class="rc">Droite</td></thead>';
				} else {
					l += '<thead class="lookhead"><td class="file">Fichier</td><td class="loc">Locuteur</td><td class="start">Début</td><td class="end">Fin</td><td class="u">Enoncé</td><td>Contexte</td></thead>';
				}
				l += resultatGlobal.join('\n');
				l += '</table>';
				l += writeEndHTML();
				toolsCallback(err, l);
			}
	});
};

tools.Kwic = function(files, field, pattern, params, kwic, output, callback) {
	tools.getPattern(files, field, pattern, params, kwic, function(err, data) {
		if (err)
			console.log('cannot process query ' + files + ' ' + field + ' ' + pattern + ' ' + params + ' ' + kwic);
		else {
			try {
				fs.writeFile(output, data, callback);
			} catch (e) {
				console.log('cannot write result to file ' + output + ' : ' + e.toString());
			}
		}		
	});
};

tools.Lexicon = function(files, field, pattern, params, output, callback) {
	tools.getLexicon(files, field, pattern, params, function(err, data) {
		if (err)
			console.log('cannot process query ' + files + ' ' + field + ' ' + pattern + ' ' + params);
		else {
			try {
				fs.writeFile(output, data, callback);
			} catch (e) {
				console.log('cannot write result to file ' + output + ' : ' + e.toString());
			}
		}		
	});
};