import {Set as ImmutableSet} from 'immutable';

import {sum} from 'd3-array';

import * as pkg from 'document-budgetaire/Records.js';
const {makeLigneBudgetId, LigneBudgetRecord,  DocumentBudgetaire} = pkg

export default function(doc, natureToChapitreFI){
    const BlocBudget = doc.getElementsByTagName('BlocBudget')[0];

    const exer = Number(BlocBudget.getElementsByTagName('Exer')[0].getAttribute('V'))

    const xmlRowsById = new Map();

    const lignes = Array.from(doc.getElementsByTagName('LigneBudget'))
        .filter(l => {
            const isReal = l.getElementsByTagName('OpBudg')[0].getAttribute('V') === '0';
            const hasNon0Amount = Number(l.getElementsByTagName('MtReal')[0].getAttribute('V')) !== 0;

            const n = l.getElementsByTagName('Nature')[0].getAttribute('V');
            const f = l.getElementsByTagName('Fonction')[0].getAttribute('V');


            return isReal &&    // on exclut les dépenses/recettes d'ordre
            // on exclut des montants nuls
            hasNon0Amount &&
            // on exclut les reports N-1 des recettes d'investissement (RI)
            // on exclut les reports N-1 des dépenses d'investissement (DI)
            !(n === '001' && f === '01') &&
            // on exclut les reports N-1 des recettes de fonctionnement (RF)
            // on exclut les reports N-1 des dépenses de fonctionnement (DF)
            !(n === '002' && f === '01')

        })
        .map(l => {
            const ret = {};

            ['Nature', 'Fonction', 'CodRD', 'MtReal'].forEach(key => {
                ret[key] = l.getElementsByTagName(key)[0].getAttribute('V')
            })

            ret['MtReal'] = Number(ret['MtReal']);

            Object.assign(
                ret,
                natureToChapitreFI(exer, ret['CodRD'], ret['Nature'])
            )

            return ret;
        })

    for(const r of lignes){
        const id = makeLigneBudgetId(r);

        const idRows = xmlRowsById.get(id) || [];
        idRows.push(r);
        xmlRowsById.set(id, idRows);
    }

    return DocumentBudgetaire({
        LibelleColl: doc.getElementsByTagName('LibelleColl')[0].getAttribute('V'),
        Nomenclature: doc.getElementsByTagName('Nomenclature')[0].getAttribute('V'),
        NatDec: BlocBudget.getElementsByTagName('NatDec')[0].getAttribute('V'),
        Exer: exer,
        IdColl: doc.getElementsByTagName('IdColl')[0].getAttribute('V'),

        rows: ImmutableSet(Array.from(xmlRowsById.values())
            .map(xmlRows => {
                const amount = sum(xmlRows.map(r => Number(r['MtReal'])))
                const r = xmlRows[0];

                // move 'Cessions d\'Immobilisation' from 'F(onctionnement)' to 'I(investissement)'
                // cf. https://github.com/dtc-innovation/dataviz-finances-montreuil/issues/101
                // cf. https://github.com/dtc-innovation/dataviz-finances-montreuil/issues/156
                if (r['Nature'] === '775' && r['CodRD'] === 'R' && r['FI'] === 'F') {
                    r['FI'] = 'I';
                }

                return LigneBudgetRecord(Object.assign(
                    {},
                    r,
                    {'MtReal': amount}
                ))
            }))
    })

}
