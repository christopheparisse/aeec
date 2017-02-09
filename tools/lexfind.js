var debug = require('./debug.js');
var tools = require('./lextools.js');
var argv = require('minimist')(process.argv.slice(2));
var versionLexFind = "0.0.2";

var usage = function (argument) {
	console.log('Concordances and lexicon ' + versionLexFind);
	console.log('');
	console.log('Usage: lexfind -f luk -s pattern -p ai -w number -t locs/tiers -o output filenames...');
	console.log('    -f l for Lexicon, u for Utterances, k for Kwic Concordances');
	console.log('    -p a for all elements in the transcription line, i for not case sensitive');
	console.log('    -w width of kwic concordances');
	console.log('    -t names of locuteurs and names of subtiers (to be preceded by a %)');
	console.log('    -s search pattern: it might be a regular expression');
	console.log('    --debug [filename]');
};

if (argv.h === true || argv.help === true || argv.f === undefined || argv._.length < 1) {
	usage();
	process.exit(1);
}
if (argv.debug===true) debug.setDebug('__all__', true);
if (typeof argv.debug==='string') debug.setDebug(argv.debug, true);
if (typeof argv.debug==='object') 
	for (var i in argv.debug)
		debug.setDebug(argv.debug[i], true);

var param;
if (argv.p === undefined)
	param = '';
else if (typeof argv.p === 'string')
	param = argv.p;
else
	param = argv.p.join('');
	
var search;
if (argv.s === undefined)
	search = null;
else if (typeof argv.s === 'string')
	search = argv.s;
else
	search = argv.s[0];

var tiers;
if (argv.t === undefined)
	tiers = [];
else if (typeof argv.t === 'string')
	tiers = [argv.t];
else
	tiers = argv.t;

var width;
if (argv.w === undefined)
	width = 1;
else if (typeof argv.w !== 'number') {
	console.log('option w requires a number > 0 and < 10');
	process.exit(1);
} else
	width = argv.w;

var output;
if (argv.o === undefined)
	output = '';
else if (typeof argv.o === 'string')
	output = argv.o;
else {
	console.log('option output requires a single file name');
	process.exit(1);
}

if (output !== '') {
	if (argv.f.substr(0,1) === 'l') {
		tools.Lexicon(argv._, tiers, search, param, output, function(err) { if (err) console.log('--error--'); else console.log('Done.') });
	}
	
	if (argv.f.substr(0,1) === 'k') {
		tools.Kwic(argv._, tiers, search, param, width, output, function(err) { if (err) console.log('--error--'); else console.log('Done.') });
	}
	
	if (argv.f.substr(0,1) === 'u') {
		tools.Kwic(argv._, tiers, search, param+'u', width, output, function(err) { if (err) console.log('--error--'); else console.log('Done.') });
	}
	
	if (argv.f.substr(0,1) === 'd') {
		tools.Div(argv._, search, param+'d', output, function(err) { if (err) console.log('--error--'); else console.log('Done.') });
	}
} else {
	if (argv.f.substr(0,1) === 'l') {
		tools.getLexicon(argv._, tiers, search, param, function(err, data) { if (!err) console.log(data); });
	}
	
	if (argv.f.substr(0,1) === 'k') {
		tools.getPattern(argv._, tiers, search, param+'k', width, function(err, data) { if (!err) console.log(data); });
	}
	
	if (argv.f.substr(0,1) === 'u') {
		tools.getPattern(argv._, tiers, search, param+'u', width, function(err, data) { if (!err) console.log(data); });
	}
	
	if (argv.f.substr(0,1) === 'd') {
		tools.getDiv(argv._, search, param+'d', function(err, data) { if (!err) console.log(data); });
	}
}

// node test.js /colaje/Enfants/antoine/antoine-37-2_04_25.teiml 
// node test.js /colaje/Enfants/antoine/antoine-11-0_11_09_chat.teiml
