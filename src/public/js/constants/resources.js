import insertionSvg from '../../../../images/Insertion.svg';
import collegesSvg from '../../../../images/Colleges.svg';
import enfanceSvg from '../../../../images/Enfance.svg';
import environnementAmenagementSvg from '../../../../images/EnvironnementAmenagement.svg';
import handicapesSvg from '../../../../images/Handicapes.svg';
import patrimoineSvg from '../../../../images/Patrimoine.svg';
import routesSvg from '../../../../images/routes.svg';
import soutienCommunesSvg from '../../../../images/SoutienCommunes.svg';
import personnesageesSvg from '../../../../images/Personnesagees.svg';
import agentesDepartementSvg from '../../../../images/AgentesDepartement.svg';
import carburantSvg from '../../../../images/Carburant.svg';
import depensesElectriciteSvg from '../../../../images/depensesElectricite.svg';

export const COMPTES_ADMINISTRATIFS = 'COMPTES_ADMINISTRATIFS';

export const AGGREGATED_ATEMPORAL = "AGGREGATED_ATEMPORAL";
export const AGGREGATED_TEMPORAL = "AGGREGATED_TEMPORAL";
export const M52_FONCTION_ATEMPORAL = "M52_FONCTION_ATEMPORAL";
export const M52_FONCTION_TEMPORAL = "M52_FONCTION_TEMPORAL";

export const CORRECTIONS_AGGREGATED = "CORRECTIONS_AGGREGATED";

export const INSERTION_PICTO = "INSERTION_PICTO";
export const COLLEGE_PICTO = "COLLEGE_PICTO";
export const ENFANCE_PICTO = "ENFANCE_PICTO";
export const ENVIRONNEMENT_AMENAGEMENT_PICTO = "ENVIRONNEMENT_AMENAGEMENT_PICTO";
export const HANDICAPES_PICTO = "HANDICAPES_PICTO";
export const PATRIMOINE_PICTO = "PATRIMOINE_PICTO";
export const ROUTES_PICTO = "ROUTES_PICTO";
export const SOUTIEN_COMMUNES_PICTO = "SOUTIEN_COMMUNES_PICTO";
export const PERSONNES_AGEES_PICTO = "PERSONNES_AGEES_PICTO";

export const AGENTS_PICTO = 'AGENTS_PICTO';
export const CARBURANT_PICTO = 'CARBURANT_PICTO';
export const ELECTRICITE_PICTO = 'ELECTRICITE_PICTO';

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
    }[env],

    // pictos
    [INSERTION_PICTO]: {
        "production": undefined,
        "demo": insertionSvg,
        get development() { return this.demo }
    }[env],
    [COLLEGE_PICTO]: {
        "production": undefined,
        "demo": collegesSvg,
        get development() { return this.demo }
    }[env],
    [ENFANCE_PICTO]: {
        "production": undefined,
        "demo": enfanceSvg,
        get development() { return this.demo }
    }[env],
    [ENVIRONNEMENT_AMENAGEMENT_PICTO]: {
        "production": undefined,
        "demo": environnementAmenagementSvg,
        get development() { return this.demo }
    }[env],
    [HANDICAPES_PICTO]: {
        "production": undefined,
        "demo": handicapesSvg,
        get development() { return this.demo }
    }[env],
    [PATRIMOINE_PICTO]: {
        "production": undefined,
        "demo": patrimoineSvg,
        get development() { return this.demo }
    }[env],
    [ROUTES_PICTO]: {
        "production": undefined,
        "demo": routesSvg,
        get development() { return this.demo }
    }[env],
    [SOUTIEN_COMMUNES_PICTO]: {
        "production": undefined,
        "demo": soutienCommunesSvg,
        get development() { return this.demo }
    }[env],
    [PERSONNES_AGEES_PICTO]: {
        "production": undefined,
        "demo": personnesageesSvg,
        get development() { return this.demo }
    }[env],
    [AGENTS_PICTO]: {
        "production": undefined,
        "demo": agentesDepartementSvg,
        get development() { return this.demo }
    }[env],
    [CARBURANT_PICTO]: {
        "production": undefined,
        "demo": carburantSvg,
        get development() { return this.demo }
    }[env],
    [ELECTRICITE_PICTO]: {
        "production": undefined,
        "demo": depensesElectriciteSvg,
        get development() { return this.demo }
    }[env]
}
