import React from 'react';

import Sunburst from './Sunburst';

export default function({
    M52Hierarchical, M52HighlightedNodes, selectedNode,
    donutWidth, outerRadius,
    onSliceOvered, onSliceSelected, width, height,
}){

    return React.createElement('div', {},
        React.createElement(Sunburst, {
            hierarchicalData: M52Hierarchical,
            highlightedNodes: M52HighlightedNodes, selectedNode,
            donutWidth, outerRadius, padAngle: 0.01,
            onSliceOvered, onSliceSelected,
            width, height,
        })
    );
}
