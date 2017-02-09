/**
 * @module debug
 * @author Christophe Parisse
 */

import * as path from 'path';

var debugList = {};

export function setDebug(fn, setting) {
    fn = path.basename(fn);
    if (setting)
        debugList[fn] = 'on';
    else
        debugList[fn] = undefined;
};

export function debug(fn) {
    if (debugList['__all__'] === 'on') return true;
    fn = path.basename(fn);
    return debugList[fn] === 'on';
};
