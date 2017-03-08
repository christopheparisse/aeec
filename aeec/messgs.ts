/**
 * @module messgs
 */

const eng = {
    newfile: 'New corpus',
    new: 'New',
    open: 'Open ...',
    save: 'Save',
    saveas: 'Save As ...',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    insertfile: 'Insert file ...',
    insertdir: 'Insert folder ...',
    insertdirselect: 'Insert specific files from folder ...',
    removefile: 'Remove file(s)',
    edit: 'Edit',
    corpus: 'Corpus',
    process: 'Process',
    opentrjs: 'Open with Trjs',
    openelan: 'Open with Elan',
    openclan: 'Open with Clan',
    openpraat: 'Open with Praat',
    opentranscriber: 'Open with Transcriber',
    converttei: 'Convert to Tei',
    convertelan: 'Convert to Elan',
    convertclan: 'Convert to Clan',
    convertpraat: 'Convert to Praat',
    converttranscriber: 'Convert to Transcriber',
    preferences: 'Preferences',
    update: 'Update conversions',
    setmaster: 'Select master doc',
    setmastertei: 'Master file Tei',
    setmasterelan: 'Master file Elan',
    setmasterclan: 'Master file Clan',
    setmasterpraat: 'Master file Praat',
    setmastertranscriber: 'Master file Transcriber',
    changeprogassoc: 'Change program location',
    saveparameters: 'Save convertion/export parameters',
    convertquick: 'Convert quickly to'
};

const fra = {
    newfile: 'Nouveau corpus',
    new: 'Nouveau',
    open: 'Ouvrir ...',
    save: 'Enregistrer',
    saveas: 'Enregistrer sous ...',
    copy: 'Copier',
    paste: 'Coller',
    cut: 'Couper',
    insertfile: 'Insérer un fichier ...',
    insertdir: 'Insérer un dossier ...',
    insertdirselect: 'Insérer certains fichiers depuis un dossier ...',
    removefile: 'Supprimer un/les fichier(s)',
    edit: 'Editer',
    corpus: 'Corpus',
    process: 'Traitement',
    opentrjs: 'Ouvrir avec Trjs',
    openelan: 'Ouvrir avec Elan',
    openclan: 'Ouvrir avec Clan',
    openpraat: 'Ouvrir avec Praat',
    opentranscriber: 'Ouvrir avec Transcriber',
    converttei: 'Convertir en Tei',
    convertelan: 'Convertir en Elan',
    convertclan: 'Convertir en Clan',
    convertpraat: 'Convertir en Praat',
    converttranscriber: 'Convertir en Transcriber',
    preferences: 'Préferences',
    update: 'Mise à jour des conversions',
    setmaster: 'Choisir document maître',
    setmastertei: 'Fichier maître Tei',
    setmasterelan: 'Fichier maître Elan',
    setmasterclan: 'Fichier maître Clan',
    setmasterpraat: 'Fichier maître Praat',
    setmastertranscriber: 'Fichier maître Transcriber',
    changeprogassoc: 'Modifier l\'emplacement des programmes',
    saveparameters: 'Sauver les paramètres convertion/export',
    convertquick: 'Convertir rapidement vers'
};

/**
 * @variable m
 * contains all message displayed by the application in various languages
*/
export let m = eng;    // default eng

export function set(lg) {
    if (lg === "eng")
        m = eng;
    else if (lg === 'fra')
        m = fra;
    else
        m = eng;
};