import {Set as ImmutableSet} from 'immutable'

import { DocumentBudgetaire, LigneBudgetRecord } from 'document-budgetaire/Records.js';
import hierarchicalByFunction from '../../src/shared/js/finance/hierarchicalByFunction';

import { DF, RF, RI, DI } from '../../src/shared/js/finance/constants';

const {documentBudgetaires} = require('../../build/finances/finance-data.json');
const docBudg = documentBudgetaires.map(db => {
    db.rows = new ImmutableSet( db.rows.map(LigneBudgetRecord) )
    return DocumentBudgetaire(db)
}).find(db => db['Exer'] === 2018);


/**
 * RDFI
 */

test(`Pour le CA 2018, DF devrait représenter ~191,6 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, DF).total;

    expect(total).toBeCloseTo(191602651.45, 1);
});

test(`Pour le CA 2018, DI devrait représenter ~60,2 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, DI).total;

    expect(total).toBeCloseTo(60181357.57, 1);
});

test(`Pour le CA 2018, RF devrait représenter ~210,3 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, RF).total;

    expect(total).toBeCloseTo(210345758.09, 1);
});

test(`Pour le CA 2018, RI devrait représenter ~43,1 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, RI).total;

    expect(total).toBeCloseTo(43108809.730000004, 1);
});
