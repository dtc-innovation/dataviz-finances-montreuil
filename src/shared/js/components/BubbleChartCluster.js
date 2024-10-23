import React, {useState, useCallback} from 'react';
import Tooltip from 'react-tooltip';
import cx from 'clsx';

import {aggregatedDocumentBudgetaireNodeTotal} from "../finance/AggregationDataStructures.js"
import {flattenTree} from "../finance/visitHierarchical.js"

import {max, sum} from "d3-array";
import page from "page";

import MoneyAmount from "./MoneyAmount.js";
import DISPLAY_MODE_ROOT, {default as BubbleChartNode} from "./BubbleChartNode.js";

export default function BubbleChartCluster(props){
    const {families, InnerTooltip} = props

    if (!families) {
        return null;
    }

    const [focusedItem, setFocusedItem] = useState(null);
    const onFocus = (itemId) => setFocusedItem(itemId);

    const getNodeUrl = (node) => {
        const [nodeId, politiqueId] = node.id.split('.');
        return `/explorer/${nodeId}/details/${politiqueId}`
    }

    const maxNodeValue = max([].concat(...families.map(f => f.children)), f => f.total);
    const total = sum(families, f => f.total);

    console.debug('families', families)
    console.debug('families total %d | max %d', total, maxNodeValue)

    return (<div className={cx('bubble-chart-cluster', focusedItem && 'with-focus')}>
        {families
            .sort((a, b) => b.total - a.total)
            .map(family => (<BubbleChartNode key={`rd-CH${family.id}`}
                                             node={family}
                                             maxNodeValue={maxNodeValue}
                                             onFocus={onFocus}
                                             focusedItem={focusedItem}
                                             onClick={(family, node) => page(getNodeUrl(node))}
                                             DISPLAY_MODE={DISPLAY_MODE_ROOT}
                                             getNodeUrl={getNodeUrl} />))}
         <Tooltip
             className="react-tooltip"
             id={`tooltip-bubblechart`}
             place="top"
             type="light"
             clickable={true}
             effect="solid"
             getContent={(nodeId) => {
                 if (!nodeId) return null;

                 const node = families.find(f => f.id === nodeId);

                 return <InnerTooltip node={node} />;
             }}/>
    </div>)
}
