/**
 * test and command line interface of teiconversion
 */

import {formatToTei, teiToFormat} from './teiconversion';
import * as minimist from 'minimist';
import {debug, setDebug} from './debug';

//global.applicationTarget = {};
global['applicationTargetType'] = 'node';

var usage = function () {
	console.log('TEI conversion : v0.0.1');
	console.log('');
	console.log('Usage: teicvt -f format -i fileinputname -o fileoutputname');
	console.log('    -f {format} (teiclan, teielan, teitranscriber, teipraat, clantei, elantei, transcribertei, praattei)');
	console.log('    --debug [filename]');
	console.log('    -h --help --usage (this message)');
};

/**
 * main procedure
 */
function main() {
	var argv = minimist(process.argv.slice(2));
	if (argv.debug===true) setDebug('__all__', true);
	if (typeof argv.debug==='string') setDebug(argv.debug, true);
	if (typeof argv.debug==='object') 
		for (var i in argv.debug)
			setDebug(argv.debug[i], true);
	
	if (debug(__filename)) console.log(argv);
    if (debug(__filename)) console.log("minimist: ", argv);
	
	if (argv.h !== undefined || argv.help === true || argv.usage === true) {
		usage();
		process.exit(1);
	}
	
	if (argv.i === undefined || typeof argv.i !== 'string') {
		console.log('exactly one input file must be defined');
		process.exit();
	}
	
	if (argv.o === undefined || typeof argv.o !== 'string') {
		console.log('exactly one output file must be defined');
		process.exit();
	}
	
	if (argv.f === undefined || typeof argv.f !== 'string') {
		console.log('exactly one format must be defined');
		process.exit();
	}

    if (debug(__filename)) console.log("start: ", argv.f, argv.i, argv.o);
    switch (argv.f) {
        case 'clantei':
            formatToTei('clan', argv.i, argv.o, (err, str) => { console.log(err, str); });
            break;
        case 'elantei':
            formatToTei('elan', argv.i, argv.o, (err, str) => { console.log(err, str); });
            break;
        case 'praattei':
            formatToTei('praat', argv.i, argv.o, (err, str) => { console.log(err, str); });
            break;
        case 'transcribertei':
            formatToTei('transcriber', argv.i, argv.o, (err, str) => { console.log(err, str); });
            break;
        case 'teiclan':
            teiToFormat('clan', argv.i, argv.o, '', (err, str) => { console.log(err, str); });
            break;
        case 'teielan':
            teiToFormat('elan', argv.i, argv.o, '', (err, str) => { console.log(err, str); });
            break;
        case 'teipraat':
            teiToFormat('praat', argv.i, argv.o, '', (err, str) => { console.log(err, str); });
            break;
        case 'teitranscriber':
            teiToFormat('transcriber', argv.i, argv.o, '', (err, str) => { console.log(err, str); });
            break;
        default:
            console.log('unknown format: ', argv.f);
            break;
    }
}

// run it

main();