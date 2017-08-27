import { Map as ImmutableMap, List } from 'immutable';

import React from 'react';
import { connect } from 'react-redux';
import { format } from 'currency-formatter';

import { scaleLinear } from 'd3-scale';
import { min, max, sum } from 'd3-array';
import { format as d3Format } from 'd3-format';
import { format as formatEuro } from 'currency-formatter';

import {m52ToAggregated, hierarchicalAggregated, hierarchicalM52}  from '../../../../shared/js/finance/memoized';
import {default as visit, flattenTree} from '../../../../shared/js/finance/visitHierarchical.js';

import { EXPENDITURES, REVENUE, DF, DI } from '../../../../shared/js/finance/constants';

import PageTitle from '../../../../shared/js/components/gironde.fr/PageTitle';
import LegendList from '../../../../shared/js/components/LegendList';

import {CHANGE_EXPLORATION_YEAR} from '../../constants/actions';

import D3Axis from '../D3Axis';
import FinanceElementPie from '../FinanceElementPie';

/*
    In this component, there are several usages of dangerouslySetInnerHTML.

    In the context of the public dataviz project, the strings being used are HTML generated by 
    a markdown parser+renderer. This part is considered trusted enough.

    The content being passed to the markdown parser is created and reviewed by the project team and likely
    by the communication team at the Département de la Gironde. So this content is very very unlikely to ever
    contain anything that could cause any harm.

    For these reasons, the usages of dangerouslySetInnerHTML are fine.
*/

/*

interface FinanceElementProps{
    contentId: string,
    amount, // amount of this element
    aboveTotal, // amount of the element in the above category
    topTotal // amount of total expenditures or revenue
    texts: FinanceElementTextsRecord,

    // the partition will be displayed in the order it's passed. Sort beforehand if necessary
    partition: Array<{
        contentId: string,
        partAmount: number,
        texts: FinanceElementTextsRecord,
        url: string
    }>
}

*/


const WIDTH = 1000;
const HEIGHT = 430;

const HEIGHT_PADDING = 70;
const BRICK_PADDING = 6;

const PARTITION_TOTAL_HEIGHT = 600;
const MIN_STRING_HEIGHT = 30;

const Y_AXIS_MARGIN = 60;

export function FinanceElement({contentId, RDFI, amountByYear, parent, top, texts, partitionByYear, year, urls, m52Rows, changeExplorationYear}) {
    const label = texts && texts.label || '';
    const atemporalText = texts && texts.atemporal;
    const temporalText = texts && texts.temporal;

    const amount = amountByYear.get(year);

    const years = partitionByYear.keySeq().toJS();

    const columnAndMarginWidth = (WIDTH - Y_AXIS_MARGIN)/(years.length+1)
    const columnMargin = columnAndMarginWidth/4;
    const columnWidth = columnAndMarginWidth - columnMargin;

    const yearScale = scaleLinear()
        .domain([min(years), max(years)])
        .range([Y_AXIS_MARGIN+columnAndMarginWidth/2, WIDTH-columnAndMarginWidth/2]);

    const maxAmount = max(amountByYear.valueSeq().toJS());

    // sort all partitions part according to the order of the last year partition
    let lastYearPartition = partitionByYear.get(max(years))
    lastYearPartition = lastYearPartition && lastYearPartition.sort((p1, p2) => p2.partAmount - p1.partAmount);
    const partitionIdsInOrder = lastYearPartition && lastYearPartition.map(p => p.contentId) || [];

    // reorder all partitions so they adhere to partitionIdsInOrder
    partitionByYear = partitionByYear.map(partition => {
        // indexOf inside a .map leads to O(n^2), but lists are 10 elements long max, so it's ok
        return partition && partition.sort((p1, p2) => partitionIdsInOrder.indexOf(p1.contentId) - partitionIdsInOrder.indexOf(p2.contentId))
    })

    let thisYearPartition = partitionByYear.get(year);

    let barchartPartitionByYear = partitionByYear;
    if(contentId === 'DF'){
        // For DF, for the split thing at the end, the whole partition is needed. 
        // However, DF-1 === DF-2, so for the barchart, we only want one of them with the label "solidarité"
        barchartPartitionByYear = barchartPartitionByYear.map(partition => {
            partition = partition.remove(partition.findIndex(p => p.contentId === 'DF-1'))

            const df2 = partition.find(p => p.contentId === 'DF-2');

            return partition.set(partition.findIndex(p => p.contentId === 'DF-2'), {
                contentId: df2.contentId,
                partAmount: df2.partAmount,
                texts: df2.texts && df2.texts.set('label', 'Actions sociales'),
                url: df2.url
            });
        })
    }

    const yAxisAmountScale = scaleLinear()
        .domain([0, maxAmount])
        .range([HEIGHT - HEIGHT_PADDING, HEIGHT_PADDING]);
    const yRange = yAxisAmountScale.range()[0] - yAxisAmountScale.range()[1];

    const ticks = yAxisAmountScale.ticks(5);

    const rectAmountScale = scaleLinear()
        .domain([0, maxAmount])
        .range([0, yRange]);

    const RDFIText = RDFI === DF ?
        'Dépense de fonctionnement' : 
        RDFI === DI ?
            `Dépense d'investissement`:
            '';

    const isLeaf = !(thisYearPartition && thisYearPartition.size >= 2);

    return React.createElement('article', {className: 'finance-element'},
        React.createElement(PageTitle, {text: RDFI ? 
            `${RDFIText} - ${label} en ${year}` :
            `${label} en ${year}`}), 
        React.createElement('h2', {}, format(amount, { code: 'EUR' })),
        React.createElement('section', {}, 
            parent || top ? React.createElement('div', {className: 'ratios'}, 
                React.createElement(FinanceElementPie, {
                    elementProportion: top ? amount/top.amount : undefined,
                    parentProportion: parent ? parent.amount/top.amount : undefined
                }),
                parent && top ? React.createElement('div', {}, 
                    `${d3Format('.1%')(amount/parent.amount)} des ${top.label} de type `,
                    React.createElement('a', {href: parent.url}, parent.label)
                ) : undefined,
                top ? React.createElement('div', {}, 
                    `${d3Format('.1%')(amount/top.amount)} des `,
                    React.createElement('a', {href: top.url}, top.label), 
                    ' totales'
                ) : undefined
            ) : undefined,
            atemporalText ? React.createElement('div', {className: 'atemporal', dangerouslySetInnerHTML: {__html: atemporalText}}) : undefined
        ),
        
        React.createElement('section', {},
            React.createElement('h2', {}, 'Évolution sur ces dernières années'),
            years.includes(year-1) ? React.createElement('p', {}, 
                `Evolution par rapport à ${year-1} : ${d3Format("+.1%")( (amount/amountByYear.get(year-1)) - 1  )}`
            ) : undefined,
            React.createElement('svg', {className: 'over-time', width: WIDTH, height: HEIGHT},
                // x axis / years
                React.createElement(D3Axis, {
                    className: 'x', 
                    tickData: years.map(y => {
                        return {
                            transform: `translate(${yearScale(y)}, ${HEIGHT-HEIGHT_PADDING})`,
                            line: { x1 : 0, y1 : 0, x2 : 0, y2 : 0 }, 
                            text: {
                                x: 0, y: -10, 
                                dy: "2em", 
                                t: y
                            },
                            id: y,
                            className: year === y ? 'selected' : undefined
                        }
                    }),
                    onSelectedAxisItem: changeExplorationYear
                }),
                // y axis / money amounts
                React.createElement(D3Axis, {className: 'y', tickData: ticks.map(tick => {
                    return {
                        transform: `translate(0, ${yAxisAmountScale(tick)})`,
                        line: {
                            x1 : 0, y1 : 0, 
                            x2 : WIDTH, y2 : 0
                        }, 
                        text: {
                            x: 0, y: -10, 
                            anchor: 'right',
                            t: (tick/1000000)+'M'
                        }
                        
                    }
                })}),
                // content
                React.createElement('g', {className: 'content'},
                    barchartPartitionByYear.entrySeq().toJS().map(([year, partition]) => {
                        const yearAmount = amountByYear.get(year);

                        partition = partition || List([{
                            contentId: contentId,
                            partAmount: yearAmount
                        }]);

                        const stackYs = partition
                            .map(p => p.partAmount)
                            .map( (amount, i, arr) => sum(arr.toJS().slice(0, i)) )
                            .map(rectAmountScale);

                        const stack = partition
                            .map((part, i) => {
                                const { partAmount } = part;
                                const height = Math.max(rectAmountScale(partAmount) - BRICK_PADDING, 4);

                                return {
                                    id: part.contentId,
                                    amount: partAmount,
                                    height,
                                    y: i === 0 ? 
                                        HEIGHT - HEIGHT_PADDING - height :
                                        HEIGHT - HEIGHT_PADDING - height - stackYs.get(i)
                                }
                            });

                        const totalHeight = rectAmountScale(yearAmount);
                        const totalY = HEIGHT - HEIGHT_PADDING - totalHeight;


                        return React.createElement('g', {transform: `translate(${yearScale(year)})`}, 
                            React.createElement('g', {},
                                stack.map( ({id, amount, height, y}, i) => {
                                    return React.createElement('g', {className: [id, `area-color-${i+1}`].join(' ')}, 
                                        React.createElement('rect', {x: -columnWidth/2, y, width: columnWidth, height, rx: 5, ry: 5})
                                    )
                                })
                            ),
                            React.createElement('text', {x: -columnWidth/2, y: totalY, dy: "-1em", dx:"0em", textAnchor: 'right'}, (yearAmount/1000000).toFixed(1)+'M€')
                        )
                    })
                )
            ),
            !isLeaf ? React.createElement(LegendList, {
                items: barchartPartitionByYear.get(year).map((p, i) => ({
                    className: p.contentId, 
                    url: p.url, 
                    text: p.texts.label, 
                    colorClassName: `area-color-${i+1}`
                })).reverse()
            }) : undefined,
            temporalText ? React.createElement('div', {className: 'temporal', dangerouslySetInnerHTML: {__html: temporalText}}) : undefined

        ),
        
        //yearText ? React.createElement('h3', {}, "Considérations spécifiques à l'année ",year) : undefined,
        //yearText ? React.createElement('section', {dangerouslySetInnerHTML: {__html: yearText}}) : undefined,

        !isLeaf ? React.createElement('section', { className: 'partition'}, 
            top ? React.createElement('h2', {}, `Détail des ${top.label} en ${year}`): undefined,
            thisYearPartition.map(({contentId, partAmount, texts, url}) => {
                return React.createElement('a',
                    {
                        href: url,
                        style:{
                            height: (PARTITION_TOTAL_HEIGHT*partAmount/amount) + MIN_STRING_HEIGHT + 'px'
                        }
                    },
                    React.createElement(
                        'div', 
                        {
                            className: 'part', 
                            style:{
                                height: (PARTITION_TOTAL_HEIGHT*partAmount/amount) + 'px'
                            }
                        }, 
                        React.createElement('span', {}, d3Format(".3s")(partAmount))
                    ),
                    React.createElement('div', {className: 'text'},
                        React.createElement('h1', {}, texts && texts.label || contentId),
                        React.createElement('a', {}, 'En savoir plus')
                    )
                );
            })  
        ) : undefined,

        isLeaf && m52Rows ? React.createElement('section', { className: 'partition'}, 
            React.createElement('h2', {}, `Consultez ces données en détail à la norme comptable M52 pour l'année ${year}`),
            React.createElement('table', {}, 
                m52Rows
                .sort((r1, r2) => r2['Montant'] - r1['Montant'])
                .map(row => {
                    return React.createElement('tr', {}, 
                        React.createElement('td', {}, row['Rubrique fonctionnelle']),
                        React.createElement('td', {}, row['Chapitre']),
                        React.createElement('td', {}, row['Article']),
                        React.createElement('td', {}, row['Libellé']),
                        React.createElement('td', {className: 'money-amount'}, formatEuro(row['Montant'], { code: 'EUR' }))
                    )
                })
            ),
            React.createElement(
                'a', 
                {
                    target: '_blank', 
                    href: 'https://www.datalocale.fr/dataset/comptes-administratifs-du-departement-de-la-gironde', 
                    style: {display: 'block', textAlign: 'center', fontSize: '1.2em', transform: 'translateY(5em)'}
                }, 
                React.createElement('i', {className: "fa fa-table", ariaHidden: true}),
                ' ',
                `Télécharger toutes les données Open Data à la norme M52 au format CSV`
            )
        ) : undefined

    );
}



export function makePartition(element, totalById, textsById){
    let children = element.children;
    children = children && typeof children.toList === 'function' ? children.toList() : children;

    return children && children.size >= 1 ? 
        List(children)
        .map(child => ({
            contentId: child.id,
            partAmount: totalById.get(child.id),
            texts: textsById.get(child.id),
            url: '#!/finance-details/'+child.id
        })) : 
        List().push({
            contentId: element.id,
            partAmount: totalById.get(element.id),
            texts: textsById.get(element.id),
            url: '#!/finance-details/'+element.id
        });
}



export function makeElementById(hierAgg, hierM52 = {}){
    let elementById = new ImmutableMap();

    flattenTree(hierAgg).forEach(aggHierNode => {
        elementById = elementById.set(aggHierNode.id, aggHierNode);
    });

    flattenTree(hierM52).forEach(m52HierNode => {
        elementById = elementById.set(m52HierNode.id, m52HierNode);
    });

    return elementById;
}

function fillChildToParent(tree, wm){
    visit(tree, e => {
        if(e.children){
            e.children.forEach(c => {
                wm.set(c, e);
            })
        }
    });
}


export default connect(
    state => {        
        const { m52InstructionByYear, textsById, financeDetailId, explorationYear } = state;

        const isM52Element = financeDetailId.startsWith('M52-');

        let RDFI;
        if(isM52Element){
            RDFI = financeDetailId.slice(4, 4+2);
        }

        const m52Instruction = m52InstructionByYear.get(explorationYear);
        const hierM52 = m52Instruction && RDFI && hierarchicalM52(m52Instruction, RDFI);
        const aggregated = m52Instruction && m52ToAggregated(m52Instruction);
        const hierAgg = m52Instruction && hierarchicalAggregated(aggregated);

        const childToParent = new WeakMap();
        if(m52Instruction){
            if(hierM52)
                fillChildToParent(hierM52, childToParent);
            
            fillChildToParent(hierAgg, childToParent);
        }
        
        const displayedContentId = financeDetailId;
        
        const elementById = (m52Instruction && makeElementById(hierAgg, hierM52)) || new ImmutableMap();
        const element = elementById.get(displayedContentId);

        const expenseOrRevenue = element && element.id ? 
            // weak test. TODO : create a stronger test
            (element.id.startsWith('D') || element.id.startsWith('M52-D') ? EXPENDITURES : REVENUE) : 
            undefined;

        const isDeepElement = element && element.id !== EXPENDITURES && element.id !== REVENUE && childToParent.get(element) !== hierM52;

        const parentElement = isDeepElement && childToParent.get(element);
        const topElement = isDeepElement && elementById.get(expenseOrRevenue);
        const topTexts = topElement && textsById.get(topElement.id);
        const topLabel = topTexts && topTexts.label || '';

        const partitionByYear = m52InstructionByYear.map(m52i => {
            const elementById = makeElementById(
                hierarchicalAggregated(m52ToAggregated(m52i)), 
                RDFI ? hierarchicalM52(m52i, RDFI): undefined
            );

            const yearElement = elementById.get(displayedContentId);

            return yearElement && makePartition(yearElement, elementById.map(e => e.total), textsById)
        });

        const amountByYear = m52InstructionByYear.map((m52i) => {
            const elementById = makeElementById(
                hierarchicalAggregated(m52ToAggregated(m52i)), 
                RDFI ? hierarchicalM52(m52i, RDFI): undefined
            );

            const yearElement = elementById.get(displayedContentId);

            return yearElement && yearElement.total;
        });

        const m52Rows = element && (!element.children || element.children.size === 0) ? 
            (isM52Element ?
                 element.elements :
                 element.elements.first()['M52Rows'] 
            ) :
            undefined

        return {
            contentId: displayedContentId, 
            RDFI,
            amountByYear,
            parent: parentElement && parentElement !== topElement && {
                amount: parentElement.total,
                label: textsById.get(parentElement.id).label,
                url: '#!/finance-details/'+parentElement.id
            },
            top: topElement && {
                amount: topElement.total,
                label: topLabel,
                url: '#!/finance-details/'+topElement.id
            },
            expenseOrRevenue,
            texts: textsById.get(displayedContentId),
            partitionByYear,
            m52Rows,
            year: explorationYear
        }

    },
    dispatch => ({
        changeExplorationYear(year){
            dispatch({
                type: CHANGE_EXPLORATION_YEAR,
                year
            })
        }
    })
)(FinanceElement);
