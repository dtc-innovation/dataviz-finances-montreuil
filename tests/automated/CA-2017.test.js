import {Set as ImmutableSet} from 'immutable'

import { DocumentBudgetaire, LigneBudgetRecord } from 'document-budgetaire/Records.js';
import hierarchicalByFunction from '../../src/shared/js/finance/hierarchicalByFunction';

import { DF, RF, RI, DI } from '../../src/shared/js/finance/constants';

const {documentBudgetaires} = require('../../build/finances/finance-data.json');
const docBudg = documentBudgetaires.map(db => {
    db.rows = new ImmutableSet( db.rows.map(LigneBudgetRecord) )
    return DocumentBudgetaire(db)
}).find(db => db['Exer'] === 2017);

/**
 * RDFI
 */

test(`Pour le CA 2017, DF devrait représenter ~192,3 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, DF).total;

    expect(total).toBeCloseTo(192300929.59, 1);
});

test(`Pour le CA 2017, DI devrait représenter ~46,2 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, DI).total;

    expect(total).toBeCloseTo(46204100.86, 1);
});

test(`Pour le CA 2017, RF devrait représenter ~210,53 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, RF).total;

    expect(total).toBeCloseTo(210527830.95, 1);
});

test(`Pour le CA 2017, RI devrait représenter ~35,66 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, RI).total;

    expect(total).toBeCloseTo(35664364.36, 1);
});
