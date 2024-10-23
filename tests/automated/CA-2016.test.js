import {Set as ImmutableSet} from 'immutable'

import { DocumentBudgetaire, LigneBudgetRecord } from 'document-budgetaire/Records.js';
import hierarchicalByFunction from '../../src/shared/js/finance/hierarchicalByFunction';

import { DF, RF, RI, DI } from '../../src/shared/js/finance/constants';

const {documentBudgetaires} = require('../../build/finances/finance-data.json');
const docBudg = documentBudgetaires.map(db => {
    db.rows = new ImmutableSet( db.rows.map(LigneBudgetRecord) )
    return DocumentBudgetaire(db)
}).find(db => db['Exer'] === 2016);

/**
 * RDFI
 */

test(`Pour le CA 2016, DF devrait représenter ~190,1 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, DF).total;

    expect(total).toBeCloseTo(190073301.88, 1);
});

test(`Pour le CA 2016, DI devrait représenter ~46,6 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, DI).total;

    expect(total).toBeCloseTo(46572738.34, 1);
});

test(`Pour le CA 2016, RF devrait représenter ~205,8 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, RF).total;

    expect(total).toBeCloseTo(205828340.90, 1);
});

test(`Pour le CA 2016, RI devrait représenter ~35,9 millions d'euros`, () => {
    const total = hierarchicalByFunction(docBudg, RI).total;

    expect(total).toBeCloseTo(35948474.76, 1);
});
