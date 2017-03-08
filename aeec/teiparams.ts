/**
 * teiparams.ts
 * interface pour la conversion et traitement des fichiers tei
 * stockage de tous les paramètres possible des commandes pouvant être utilisés en paramètres
 * author: Christophe Parisse
 * février 2017
 */

export let teiParameters = {
    raw: false,
};

export function toString() {
    let s = "raw=" + teiParameters.raw + "\n";
    return s;
}
export function setRaw(value: boolean) {
    teiParameters.raw = value;
    console.log(teiParameters);
}

export function getRaw(): boolean {
    return teiParameters.raw;
}
