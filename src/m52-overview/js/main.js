
import { Record, OrderedSet as ImmutableSet } from 'immutable';

import { createStore } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';

import {hierarchicalM52} from '../../shared/js/finance/memoized';
import xmlDocumentToDocumentBudgetaire from '../../shared/js/finance/xmlDocumentToDocumentBudgetaire';
import makeNatureToChapitreFI from '../../shared/js/finance/makeNatureToChapitreFI.js';
import visitHierarchical from '../../shared/js/finance/visitHierarchical.js';
import {assets} from '../../public/js/constants/resources';
import {PAR_PUBLIC_VIEW, PAR_PRESTATION_VIEW, M52_INSTRUCTION, EXPENDITURES, REVENUE} from '../../shared/js/finance/constants';
import {
    DOCUMENT_BUDGETAIRE_RECEIVED,
} from '../../public/js/constants/actions';

import TopLevel from './components/TopLevel.js';

const SOURCE_FINANCE_DIR = './data/finances/'

function reducer(state, action){
    const {type} = action;

    switch(type){
        case DOCUMENT_BUDGETAIRE_RECEIVED:
            return state.set('documentBudgetaire', action.docBudg);
        case 'M52_INSTRUCTION_USER_NODE_OVERED':
            return state
                .set('over', action.node ?
                    new InstructionNodeRecord({
                        type: M52_INSTRUCTION,
                        node: action.node
                    }) :
                    undefined
                );
        case 'M52_INSTRUCTION_USER_NODE_SELECTED': {
            const { node } = action;
            const {node: alreadySelectedNode} = state.set('selection') || {};

            return state
                .set('selection', node && node !== alreadySelectedNode ?
                    new InstructionNodeRecord({
                        type: M52_INSTRUCTION,
                        node
                    }) :
                    undefined
                );
        }
        case 'RDFI_CHANGE':
            return state
                .set('RDFI', action.rdfi)
                .set('over', undefined)
                .set('selection', undefined);
        case 'DF_VIEW_CHANGE':
            return state
                .set('DF_VIEW', action.dfView)
                .set('over', undefined)
                .set('selection', undefined);
        default:
            console.warn('Unknown action type', type);
            return state;
    }
}


let childToParent;

function findSelectedNodeAncestors(tree, selectedNode){
    if(!selectedNode)
        return undefined;

    if(!childToParent)
        childToParent = new WeakMap();

    if(tree === selectedNode){
        let result = [];
        let current = selectedNode;
        while(current !== undefined){
            result.push(current);
            current = childToParent.get(current);
        }
        return new ImmutableSet(result);
    }

    let ret;

    if(tree.children){
        Array.from(tree.children.values()).forEach(child => {
            childToParent.set(child, tree);
            const ancestors = findSelectedNodeAncestors(child, selectedNode);
            if(ancestors)
                ret = ancestors;
        })
    }

    return ret;
}

function findSelectedM52NodesByM52Rows(M52Node, m52Rows){
    let result = [];

    visitHierarchical(M52Node, n => {
        if(m52Rows.some(row => n.elements.has(row))){
            result.push(n);
        }
    });

    return new ImmutableSet(result);
}


function mapStateToProps(state){
    const documentBudgetaire = state.get('documentBudgetaire');
    const rdfi = state.get('RDFI');
    const view = state.get('DF_VIEW');
    const over = state.get('over');
    const selection = state.get('selection');
    const {type: overType, node: overedNode} = over || {};
    const {type: selectedType, node: selectedNode} = selection || {};

    const expOrRev = rdfi[0] === 'D' ? EXPENDITURES : REVENUE;

    if(!documentBudgetaire)
        return {};

    const mainHighlightNode = overedNode || selectedNode;
    const mainHighlightType = overType || selectedType;

    const M52Hierarchical = hierarchicalM52(documentBudgetaire, rdfi);

    let M52HighlightedNodes;

    if(mainHighlightType === M52_INSTRUCTION){
        M52HighlightedNodes = findSelectedNodeAncestors(M52Hierarchical, mainHighlightNode);
    }

    return {
        rdfi, dfView: view,
        documentBudgetaire,
        M52Hierarchical, M52HighlightedNodes,
        over, selection
    };
}

function mapDispatchToProps(dispatch){
    return {
        onM52NodeOvered(node){
            dispatch({
                type: 'M52_INSTRUCTION_USER_NODE_OVERED',
                node
            });
        },
        onM52NodeSelected(node){
            dispatch({
                type: 'M52_INSTRUCTION_USER_NODE_SELECTED',
                node
            });
        },
        onRDFIChange(rdfi){
            dispatch({
                type: 'RDFI_CHANGE',
                rdfi
            });
        },
        onNewM52CSVFile(content){
            const doc = (new DOMParser()).parseFromString(content, "text/xml");
            natureToChapitreFIP.then(natureToChapitreFI => {
                dispatch({
                    type: DOCUMENT_BUDGETAIRE_RECEIVED,
                    docBudg: xmlDocumentToDocumentBudgetaire(doc, natureToChapitreFI)
                });
            }).catch(console.error);

        }
    };
}

const BoundTopLevel = connect(
  mapStateToProps,
  mapDispatchToProps
)(TopLevel);


const InstructionNodeRecord = Record({
    type: undefined,
    node: undefined
});

const StoreRecord = Record({
    documentBudgetaire: undefined,
    selection: undefined,
    over: undefined,
    RDFI: undefined,
    DF_VIEW: undefined
});

const store = createStore(
    reducer,
    new StoreRecord({
        RDFI: 'DF',
        DF_VIEW: PAR_PUBLIC_VIEW
    })
);


const natureToChapitreFIP = Promise.all([
    'M14-M14_COM_SUP3500-2017.xml'
].map(f => fetch(`${SOURCE_FINANCE_DIR}plansDeCompte/${f}`).then(r => r.text())
    .then( str => {
        return (new DOMParser()).parseFromString(str, "text/xml");
    })
))
.then(makeNatureToChapitreFI)


fetch(`${SOURCE_FINANCE_DIR}CA/CA 2017.xml`).then(resp => resp.text())
.then(str => {
    return (new DOMParser()).parseFromString(str, "text/xml");
})
.then(doc => {
    return natureToChapitreFIP.then(natureToChapitreFI => {
        return xmlDocumentToDocumentBudgetaire(doc, natureToChapitreFI)
    })
})
.then(docBudg => {
    store.dispatch({
        type: 'DOCUMENT_BUDGETAIRE_RECEIVED',
        docBudg,
    });
})
.catch(console.error);

ReactDOM.render(
    React.createElement(
        Provider,
        {store},
        React.createElement(BoundTopLevel)
    ),
    document.querySelector('.react-container')
);
