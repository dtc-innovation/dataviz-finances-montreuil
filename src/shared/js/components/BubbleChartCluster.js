import React from 'react';

import { hierarchicalByFunction } from "../finance/memoized.js";
import {aggregatedDocumentBudgetaireNodeTotal} from "../finance/AggregationDataStructures.js"

import MoneyAmount from "./MoneyAmount.js";
import BubbleChartNode from "./BubbleChartNode.js";

export default function BubbleChartCluster({tree}){

    if (!tree) {
        return null;
    }

    // PROBLEM This is super-hardcoded
    const families = tree
        .children.toJS()
        .map(node => {
            return {
                id: node.id,
                label: node.label,
                total: aggregatedDocumentBudgetaireNodeTotal(node),
                rdfi: node.rdfi,
                children: node.children.map(c => {
                    return {
                        id: c.id,
                        label: c.label,
                        total: aggregatedDocumentBudgetaireNodeTotal(c),
                        rdfi: c.rdfi,
                        children: c.children.map(c => {
                            return {
                                id: c.id,
                                label: c.label,
                                total: aggregatedDocumentBudgetaireNodeTotal(c),
                                rdfi: c.rdfi,
                            }
                        })
                    }
                })
            }
        })

    return (<div className="bubble-chart-cluster">
        {families.map((node) => (<BubbleChartNode key={`rd-CH${node.id}`} node={node} />))}
    </div>)
}
