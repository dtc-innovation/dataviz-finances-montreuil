import {AggregatedDocumentBudgetaire} from './AggregationDataStructures.js'
import makeLigneBudgetFilterFromFormula from './DocumentBudgetaireQueryLanguage/makeLigneBudgetFilterFromFormula.js'

export default function makeAggregateFunction(aggregationDescription){

    function aggregationDescriptionNodeToAggregatedDocumentBudgetaireNode(aggregationDescriptionNode, documentBudgetaire){
        const {id, label, children, formula} = aggregationDescriptionNode;
        return AggregatedDocumentBudgetaire(Object.assign(
            {
                id,
                label,
                rdfi: (id.includes(' RECETTE ') ? 'R' : 'D') + (id.includes(' FONCTIONNEMENT ') ? 'F' : 'I'),
            },
            formula ?
                // leaf
                {
                    elements: documentBudgetaire.rows.filter(makeLigneBudgetFilterFromFormula(formula))
                } : // non-leaf, has .children
                {
                    children: children.map(n => aggregationDescriptionNodeToAggregatedDocumentBudgetaireNode(n, documentBudgetaire))
                }
        ))
    }

    return function aggregate(docBudg){
        return aggregationDescriptionNodeToAggregatedDocumentBudgetaireNode(aggregationDescription, docBudg)
    }
}
