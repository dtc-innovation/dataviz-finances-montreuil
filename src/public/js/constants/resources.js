export const COMPTES_ADMINISTRATIFS = 'COMPTES_ADMINISTRATIFS';

export const AGGREGATED_ATEMPORAL = "AGGREGATED_ATEMPORAL";
export const AGGREGATED_TEMPORAL = "AGGREGATED_TEMPORAL";
export const M52_FONCTION_ATEMPORAL = "M52_FONCTION_ATEMPORAL";
export const M52_FONCTION_TEMPORAL = "M52_FONCTION_TEMPORAL";

export const CORRECTIONS_AGGREGATED = "CORRECTIONS_AGGREGATED";

const env = process.env.NODE_ENV;

export const assets = {
    // finance data
    [COMPTES_ADMINISTRATIFS]: {
        "production": undefined,
        "demo": `../build/finances/doc-budgs.json`,
        "development": `../build/finances/doc-budgs.json`,
    }[env],
    [CORRECTIONS_AGGREGATED]: {
        "production": undefined,
        "demo": `../data/finances/corrections-agregation.csv`,
        "development": `/data/finances/corrections-agregation.csv`
    }[env],

    // texts
    [AGGREGATED_ATEMPORAL]: {
        "production": undefined,
        "demo": `../data/texts/aggregated-atemporal.csv`,
        "development": `../data/texts/aggregated-atemporal.csv`
    }[env],
    [AGGREGATED_TEMPORAL]: {
        "production": undefined,
        "demo":  `/../data/texts/aggregated-temporal.csv`,
        "development": `../data/texts/aggregated-temporal.csv`
    }[env]
}
