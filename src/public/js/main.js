import { createStore } from 'redux';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Record, Map as ImmutableMap, List, Set as ImmutableSet } from 'immutable';
import { csv } from 'd3-fetch';
import page from 'page';

import {assets, FINANCE_DATA, AGGREGATED_ATEMPORAL, AGGREGATED_TEMPORAL, CORRECTIONS_AGGREGATED} from './constants/resources';
import reducer from './reducer';

import * as pkg from 'document-budgetaire/Records.js';
const {LigneBudgetRecord, DocumentBudgetaire} = pkg;
import csvStringToCorrections from '../../shared/js/finance/csvStringToCorrections.js';

import Breadcrumb from '../../shared/js/components/Breadcrumb';
import ExploreBudget from './components/screens/ExploreBudget';

import { HOME } from './constants/pages';
import {
    FINANCE_DATA_RECIEVED, CORRECTION_AGGREGATION_RECEIVED,
    ATEMPORAL_TEXTS_RECEIVED, TEMPORAL_TEXTS_RECEIVED,
    FINANCE_DETAIL_ID_CHANGE, CHANGE_EXPLORATION_YEAR,
    CHANGE_POLITIQUE_VIEW,
} from './constants/actions';


import {fonctionLabels} from '../../../build/finances/finance-strings.json';


/**
 *
 * Initialize Redux store + React binding
 *
 */
const REACT_CONTAINER_SELECTOR = '.finance-dataviz-container';
const CONTAINER_ELEMENT = document.querySelector(REACT_CONTAINER_SELECTOR);

CONTAINER_ELEMENT.setAttribute('aria-live', true);

// Breadcrumb
const BREADCRUMB_CONTAINER = document.body.querySelector('.ariane-container .filAriane');

const DEFAULT_BREADCRUMB = List([
    {
        text: 'Accueil',
        url: '/'
    },
    {
        text: 'Vie citoyenne',
        url: '/vie-citoyenne/la-municipalite/'
    },
    {
        text: 'Finances et marchés publics',
        url: '/vie-citoyenne/finances-et-marches-publics/'
    },
]);

const logError = (error) => console.error(error.message, error.trace);

const StoreRecord = Record({
    docBudgByYear: undefined,
    aggregationByYear: undefined,
    corrections: undefined,
    explorationYear: undefined,
    // ImmutableMap<id, FinanceElementTextsRecord>
    textsById: undefined,
    financeDetailId: undefined,
    politiqueId: undefined,
    politiqueView: undefined,
    screenWidth: undefined,
    resources: {
        dataUrl: undefined,
        reportsUrl: undefined,
        sourceCodeUrl: undefined,
    },
});

const store = createStore(
    reducer,
    new StoreRecord({
        docBudgByYear: new ImmutableMap(),
        aggregationByYear: new ImmutableMap(),
        explorationYear: undefined,
        financeDetailId: undefined,
        politiqueId: undefined,
        textsById: ImmutableMap([[HOME, {label: 'Accueil'}]]),
        politiqueView: 'aggregated',
        screenWidth: window.innerWidth,
        resources: {
            dataUrl: 'https://data.montreuil.fr/explore/dataset/comptes-administratifs/',
            reportsUrl: 'https://www.montreuil.fr/vie-citoyenne/finances-et-marches-publics/le-compte-administratif/',
            sourceCodeUrl: 'https://github.com/dtc-innovation/dataviz-finances-montreuil/',
        }
    })
);



store.dispatch({
    type: ATEMPORAL_TEXTS_RECEIVED,
    textList: Object.keys(fonctionLabels)
        .map(fonction => ({
            id: `M52-DF-${fonction}`,
            label: fonctionLabels[fonction]
        }))
});
store.dispatch({
    type: ATEMPORAL_TEXTS_RECEIVED,
    textList: Object.keys(fonctionLabels)
        .map(fonction => ({
            id: `M52-DI-${fonction}`,
            label: fonctionLabels[fonction]
        }))
});



/**
 *
 * Fetching initial data
 *
 */
fetch(assets[CORRECTIONS_AGGREGATED]).then(resp => resp.text())
    .then(csvStringToCorrections)
    .then(corrections => {
        store.dispatch({
            type: CORRECTION_AGGREGATION_RECEIVED,
            corrections
        });
    })
    .catch(logError);


const docBudgsP = fetch(assets[FINANCE_DATA]).then(resp => resp.json())
    .then(({documentBudgetaires, aggregations}) => {
        documentBudgetaires = documentBudgetaires.map(db => {
            db.rows = new ImmutableSet(db.rows.map(LigneBudgetRecord))
            return DocumentBudgetaire(db)
        })

        const mostRecentYear = documentBudgetaires.map(({Exer}) => Exer).sort((a, b) => a-b).pop()

        store.dispatch({
            type: CHANGE_EXPLORATION_YEAR,
            year: mostRecentYear,
        });

        store.dispatch({
            type: FINANCE_DATA_RECIEVED,
            documentBudgetaires,
            aggregations
        });

        return documentBudgetaires;
    })
    .catch(logError);


csv(assets[AGGREGATED_ATEMPORAL])
    .then(textList => {
        store.dispatch({
            type: ATEMPORAL_TEXTS_RECEIVED,
            textList
        });
    })
    .catch(logError);

csv(assets[AGGREGATED_TEMPORAL])
    .then(textList => {
        store.dispatch({
            type: TEMPORAL_TEXTS_RECEIVED,
            textList
        });
    })
    .catch(logError);



/**
 *
 * Routing
 *
 */

const exploreView = ({params}) => {
    const contentRoot = createRoot(CONTAINER_ELEMENT)
    const breadcrumbRoot = createRoot(BREADCRUMB_CONTAINER)
    const {financeDetailId, politiqueId} = params
    store.dispatch({ type: FINANCE_DETAIL_ID_CHANGE, financeDetailId, politiqueId })

    contentRoot.render(
        <Provider store={store}><ExploreBudget /></Provider>,
    );

    const breadcrumb = DEFAULT_BREADCRUMB.push({
        text: 'Recettes et dépenses open data',
        url: '#!/explorer/DEPENSE/FONCTIONNEMENT'
    });

    breadcrumbRoot.render(<Breadcrumb items={breadcrumb} />);
}

page('/', () => page.redirect('/explorer/DEPENSE/FONCTIONNEMENT'));
page('/explorer/:financeDetailId(.*)/details', (event) => {
    store.dispatch({ type: CHANGE_POLITIQUE_VIEW, view:'tabular' })
    exploreView(event)
});
page('/explorer/:financeDetailId(.*)/details/:politiqueId(.*)', (event) => {
    store.dispatch({ type: CHANGE_POLITIQUE_VIEW, view:'tabular' })
    exploreView(event)
});
page('/explorer/:financeDetailId(.*)', (event) => {
    store.dispatch({ type: CHANGE_POLITIQUE_VIEW, view:'aggregated' })
    exploreView(event)
});
page('*', (ctx) => {
    console.error('Page introuvable %o', ctx);
});

page.base(location.pathname);
page.strict(true);

page({ hashbang: true });
