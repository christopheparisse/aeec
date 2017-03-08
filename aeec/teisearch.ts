/**
 * teisearch.ts
 * interface pour la recherche et le lexique des fichiers tei
 * stockage de tous les paramètres possible des commandes pouvant être utilisés en paramètres
 * author: Christophe Parisse
 * février 2017
 */

export let teiSearch = {
    command: "",
    motif: "",
    tiers: "",
};

export function toString() {
    let s = "command=" + teiSearch.command + "\n";
    return s;
}

export function setCommand(value: string) {
    teiSearch.command = value;
    console.log(teiSearch);
}

export function getCommand(): string {
    return teiSearch.command;
}

export function setMotif(value: string) {
    teiSearch.motif = value;
    console.log(teiSearch);
}

export function getMotif(): string {
    return teiSearch.motif;
}

export function setTiers(value: string) {
    teiSearch.tiers = value;
    console.log(teiSearch);
}

export function getTiers(): string {
    return teiSearch.tiers;
}
