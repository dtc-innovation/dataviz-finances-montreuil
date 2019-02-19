import { Map as ImmutableMap } from 'immutable';

import React from 'react';
import { connect } from 'react-redux';

import Markdown from '../../../../shared/js/components/Markdown';
import PageTitle from '../../../../shared/js/components/gironde.fr/PageTitle';
import DownloadSection from "../../../../shared/js/components/gironde.fr/DownloadSection";

import TotalAppetizer from '../TotalAppetizer';
import Appetizer from '../Appetizer';

import {flattenTree} from '../../../../shared/js/finance/visitHierarchical.js';
import {m52ToAggregated, hierarchicalAggregated}  from '../../../../shared/js/finance/memoized';

import { SOLIDARITES, INVEST, PRESENCE } from '../../constants/pages';
import { EXPENDITURES } from '../../../../shared/js/finance/constants';


export function Home({
    expenditures,
    currentYear,
    assets: {
        explore,
        solidarity, invest, presence
    }
}) {

    return React.createElement('article', {className: 'home'},
        React.createElement('div', {},
            React.createElement(PageTitle, {text: "Un budget au service de ???"}),
            React.createElement(Markdown, {}, `Gestion des ?? pour accompagner ?? au quotidien.`)
        ),

        React.createElement('section', {className: 'appetizers-container'},
            React.createElement('div', {className: 'appetizers'},

                React.createElement(TotalAppetizer, {
                    total: expenditures,
                    year: currentYear,
                    exploreUrl: explore
                }),
                React.createElement(Appetizer, {
                    h1: "Solidarités",
                    numberMain: "XYZ 000",
                    numberSecundary: "prestations allouées",
                    description: `??`,
                    moreUrl: solidarity
                }),
                React.createElement(Appetizer, {
                    h1: "Investissements",
                    numberMain: "X millions",
                    numberSecundary: "à l’horizon 2020",
                    description: `??`,
                    moreUrl: invest
                }),
                React.createElement(Appetizer, {
                    h1: "Présence sur le territoire",
                    numberMain: "X métiers",
                    numberSecundary: "Y sites",
                    description: `??`,
                    moreUrl: presence
                })
            )
        ),

        React.createElement(DownloadSection)
    );
}


export default connect(
    state => {
        const { docBudgByYear, corrections, currentYear } = state;
        const m52Instruction = docBudgByYear.get(currentYear);

        const aggregated = m52Instruction && corrections && m52ToAggregated(m52Instruction, corrections);
        const hierAgg = m52Instruction && hierarchicalAggregated(aggregated);

        let elementById = new ImmutableMap();

        if(m52Instruction){
            flattenTree(hierAgg).forEach(aggHierNode => {
                elementById = elementById.set(aggHierNode.id, aggHierNode);
            });
        }

        const totalById = elementById.map(e => e.total);

        return {
            currentYear,
            assets: {
                explore: '#!/explorer',
                solidarity: '#!/focus/'+SOLIDARITES,
                invest: '#!/focus/'+INVEST,
                presence: '#!/focus/'+PRESENCE
            },
            expenditures: totalById.get(EXPENDITURES)
        }


    },
    () => ({})
)(Home);
