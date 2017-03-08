import * as debug from './debug';
import * as tools from './lextools';
import * as utils from '../aeec/utils';

export function parseargs(args): any {
	let argv = require('minimist')(args);
	let versionLexFind = "0.1.1";

	let usage = function() {
		console.log('Concordances and lexicon ' + versionLexFind);
		console.log('');
		console.log('Usage: lexfind -f luk -s pattern -p ai -w number -t locs/tiers -o output filenames...');
		console.log('  -f l for Lexicon, u for Utterances, k for Kwic Concordances');
		console.log('  -p a for all elements in the transcription line, i for not case sensitive');
		console.log('  -w width of kwic concordances');
		console.log('  -t names of locuteurs and names of subtiers (to be preceded by a %)');
		console.log('  -s search pattern: it might be a regular expression');
		console.log('  --debug [filename]');
	};

	if (argv.h === true || argv.help === true || argv.f === undefined || argv._.length < 1) {
		usage();
		return undefined;
	}
	if (argv.debug===true) debug.setDebug('__all__', true);
	if (typeof argv.debug==='string') debug.setDebug(argv.debug, true);
	if (typeof argv.debug==='object') 
		for (let i in argv.debug)
			debug.setDebug(argv.debug[i], true);

	let param;
	if (argv.p === undefined)
		param = '';
	else if (typeof argv.p === 'string')
		param = '!' + argv.p + '!';
	else
		param = '!' + argv.p.join('!') + '!';
		
	let search;
	if (argv.s === undefined)
		search = null;
	else if (typeof argv.s === 'string')
		search = argv.s;
	else
		search = argv.s[0];

	let tiers;
	if (argv.t === undefined)
		tiers = [];
	else if (typeof argv.t === 'string')
		tiers = [argv.t];
	else
		tiers = argv.t;

	let width;
	if (argv.w === undefined)
		width = 1;
	else if (typeof argv.w !== 'number') {
		console.log('option w requires a number > 0 and < 10');
		return undefined;
	} else
		width = argv.w;

	let output;
	if (argv.o === undefined)
		output = '';
	else if (typeof argv.o === 'string')
		output = argv.o;
	else {
		console.log('option output requires a single file name');
		return undefined;
	}
	return {
		command: argv.f,
		files: argv._,
		tiers: tiers,
		search: search,
		width: width,
		param: param,
		output: output
	};
}

export function process(command, files, tiers, search, width, param, output) {
	if (output !== '') {
		if (command.substr(0,1) === 'l') {
			tools.Lexicon(files, tiers, search, param, output, function(err) {
					if (err) console.log('--error--'); else console.log('Done.') });
		}
		
		if (command.substr(0,1) === 'k') {
			tools.Kwic(files, tiers, search, param+'k!', width, output, function(err) { if (err) console.log('--error--'); else console.log('Done.') });
		}
		
		if (command.substr(0,1) === 'u') {
			tools.Kwic(files, tiers, search, param+'u!', width, output, function(err) { if (err) console.log('--error--'); else console.log('Done.') });
		}
		
		if (command.substr(0,1) === 'd') {
			tools.Div(files, search, param+'d!', output, function(err) { if (err) console.log('--error--'); else console.log('Done.') });
		}
	} else {
		if (command.substr(0,1) === 'l') {
			tools.getLexicon(files, tiers, search, param, function(err, data) { if (!err) console.log(data); });
		}
		
		if (command.substr(0,1) === 'k') {
			tools.getPattern(files, tiers, search, param+'k!', width, function(err, data) { if (!err) console.log(data); });
		}
		
		if (command.substr(0,1) === 'u') {
			tools.getPattern(files, tiers, search, param+'u!', width, function(err, data) { if (!err) console.log(data); });
		}
		
		if (command.substr(0,1) === 'd') {
			tools.getDiv(files, search, param+'d!', function(err, data) { if (!err) console.log(data); });
		}
	}
}

export function exec(command, files, tiers, search, width, param, output) {
	if (output === '') {
		if (command.substr(0,1) === 'l') {
			tools.getLexicon(files, tiers, search, param+'div!', function(err, data) {
				if (err) console.log('error in Lexixon');
				$('#details-results').html(data);
			});
		}
		if (command.substr(0,1) === 'k') {
			tools.getPattern(files, tiers, search, param+'k!'+'div!', width, function(err, data) {
				if (err) console.log('error in Kwic (k)');
				$('#details-results').html(data);
			});
		}
		
		if (command.substr(0,1) === 'u') {
			tools.getPattern(files, tiers, search, param+'u!'+'div!', width, function(err, data) {
				if (err) console.log('error in Kwic (u)');
				$('#details-results').html(data);
			});
		}
		
		if (command.substr(0,1) === 'd') {
			tools.getDiv(files, search, param+'d!'+'div!', function(err, data) {
				if (err) console.log('error in Div');
				$('#details-results').html(data);
			});
		}
	}
}

export function query(str) {
	let ps = parseargs(utils.parsequotes(str));
	exec(ps.command, ps.files, ps.tiers, ps.search, ps.width, ps.param, ps.output);
}
