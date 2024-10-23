import {Set as ImmutableSet} from 'immutable'
import {sum} from 'd3-array';

import * as pkg from 'document-budgetaire/Records.js';
const { DocumentBudgetaire, LigneBudgetRecord } = pkg;
import hierarchicalByFunction from '../../src/shared/js/finance/hierarchicalByFunction';
import {flattenTree} from '../../src/shared/js/finance/visitHierarchical.js';

import { DF, RF, RI, DI } from '../../src/shared/js/finance/constants';

const {documentBudgetaires, aggregations} = require('../../build/finances/finance-data.json');
const docBudg = documentBudgetaires.map(db => {
    db.rows = new ImmutableSet( db.rows.map(LigneBudgetRecord) )
    return DocumentBudgetaire(db)
}).find(db => db['Exer'] === 2018);

const aggregationTree = aggregations.find(({year}) => year === 2018).aggregation;
const aggregation = flattenTree(aggregationTree).filter(node => 'elements' in node);

/**
 * RDFI
 */

test(`L'aggrégation DF devrait avoir le même montant que la hiérarchie DF`, () => {
    const hierarchicalTotal = hierarchicalByFunction(docBudg, DF).total;
    const aggregationTotal = sum(
        aggregation.filter(({id}) => id.includes('DEPENSE/FONCTIONNEMENT')),
        ({elements}) => sum(elements, ({MtReal}) => MtReal)
    );

    expect(aggregationTotal).toBeCloseTo(hierarchicalTotal, 2);
});

test(`L'aggrégation DI devrait avoir le même montant que la hiérarchie DI`, () => {
    const hierarchicalTotal = hierarchicalByFunction(docBudg, DI).total;
    const aggregationTotal = sum(
        aggregation.filter(({id}) => id.includes('DEPENSE/INVESTISSEMENT')),
        ({elements}) => sum(elements, ({MtReal}) => MtReal)
    );

    expect(aggregationTotal).toBeCloseTo(hierarchicalTotal, 2);
});

test(`L'aggrégation RF devrait avoir le même montant que la hiérarchie RF`, () => {
    const hierarchicalTotal = hierarchicalByFunction(docBudg, RF).total;
    const aggregationTotal = sum(
        aggregation.filter(({id}) => id.includes('RECETTE/FONCTIONNEMENT')),
        ({elements}) => sum(elements, ({MtReal}) => MtReal)
    );

    expect(aggregationTotal).toBeCloseTo(hierarchicalTotal, 2);
});

test(`L'aggrégation RI devrait avoir le même montant que la hiérarchie RI`, () => {
    const hierarchicalTotal = hierarchicalByFunction(docBudg, RI).total;
    const aggregationTotal = sum(
        aggregation.filter(({id}) => id.includes('RECETTE/INVESTISSEMENT')),
        ({elements}) => sum(elements, ({MtReal}) => MtReal)
    );

    expect(aggregationTotal).toBeCloseTo(hierarchicalTotal, 2);
});
