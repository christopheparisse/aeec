/**
 * @module help.ts
 */

import {dialog} from 'electron';

export const version = '0.2.0 - 01-03-2017';

export function shortHelp() {
    var s = "Version : " + version + " \n\n\
AEEC (Agrégation, Exploration, Edition de Corpus) est un agrégateur \
de fichiers (d'enregistrements avec transcription) \
qui permet d'organiser des corpus de langage et de réaliser \
des actions sur les corpus ainsi aggrégés. La plupart des actions \
lancées par AEEC font appel à des programmes externes. Certaines \
actions (notamment celles qui utilisent le format TEI) peuvent \
être réalisées directement par AEEC.\nCopyright Christophe Parisse.";
    if (typeof alert !== 'undefined')
        alert(s);
    else
        dialog.showErrorBox('AEEC', s);
};