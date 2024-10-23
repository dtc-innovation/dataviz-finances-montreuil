import React, {Fragment, useRef, useEffect} from 'react';
import {group, sum} from 'd3-array';
import cx from 'clsx';

import * as pkg  from 'document-budgetaire/Records.js';
const {makeLigneBudgetId} = pkg;

import {natureLabels,fonctionLabels} from '../../../../build/finances/finance-strings.json';
import {currencyFormat} from './MoneyAmount.js';

const SPACE_REGEX = new RegExp(' ', 'g');
const DOT_REGEX = new RegExp('\\.', 'g');
const PRE_DOT = new RegExp('^(.+)\\.');

const byPolitique = (politiqueId) => (politiqueId
    ? function filteredRows(r){ return r.id.includes('.' + politiqueId) }
    : function allRows () { return true }
);
const byAmount = (r1, r2) => r2['MtReal'] - r1['MtReal'];
const byGroupTotal = ([,,totalA], [,,totalB]) => totalB - totalA;
const id = (string) => string.replace(PRE_DOT, '').replace(SPACE_REGEX, '-').replace(DOT_REGEX, '--');


export default function DetailsTable({families, politiqueId}) {
    const tableElement = useRef();

    useEffect(() => tableElement.current.scrollIntoView());

    return <table className="raw-data" ref={tableElement}>
        <tbody>
            {families.filter(byPolitique(politiqueId)).map(Politique => {
                return <Fragment key={Politique.id}>
                    <tr className="colgroup colgroup--group">
                        <th id={id(Politique.id)} scope="colgroup">{Politique.label}</th>
                        <th className="money-amount" scope="colgroup" aria-label={`Montant total : ${currencyFormat(Politique.total)}`}>
                            {currencyFormat(Politique.total)}
                        </th>
                    </tr>

                    {Politique.children.map(SousPolitique => {
                        const lignesByNature = Array.from(
                            group(SousPolitique.elements, (ligne) => ligne['Nature'])
                        ).map(([id, lignes]) => [id, lignes, sum(lignes, ligne => ligne['MtReal'])])

                        return <Fragment key={SousPolitique.id}>
                            <tr className="colgroup colgroup--subgroup">
                                <th id={id(SousPolitique.id)} scope="colgroup">
                                    {SousPolitique.label}
                                </th>
                                <th className="money-amount" scope="colgroup" aria-label={`Montant total : ${currencyFormat(SousPolitique.total)}`}>
                                    {currencyFormat(SousPolitique.total)}
                                </th>
                            </tr>
                            <tr>
                                <th id="raw-col-nature" scope="col">Nature</th>
                                <th id="raw-col-montant" scope="col" className="digits">Montant</th>
                            </tr>
                            {lignesByNature.sort(byGroupTotal).map(([Nature, group, groupTotal]) => {
                                const firstLigne = group[0];
                                return <Fragment key={Nature}>
                                    <tr className="raw-record" tabIndex="0" data-id={group.length === 1 && `N${firstLigne['Nature']}F${firstLigne['Fonction']}`}>
                                        <td headers={`${id(Politique.id)} ${id(SousPolitique.id)} raw-col-nature`}>
                                            {natureLabels[Nature]}
                                        </td>
                                        <td headers={`${id(Politique.id)} ${id(SousPolitique.id)} raw-col-montant`} className="money-amount">
                                            {currencyFormat(groupTotal)}
                                        </td>
                                    </tr>
                                    {group.length > 1 && group.sort(byAmount).map((ligne, i) => (
                                        <tr key={makeLigneBudgetId(ligne)} data-id={`N${ligne['Nature']}F${ligne['Fonction']}`} className={cx('raw-record','raw-record--nature-detail', i === group.length-1 && 'last-item')}>
                                            <td>{fonctionLabels[ ligne['Fonction'] ]}</td>
                                            <td className="money-amount">
                                                {currencyFormat(ligne['MtReal'])}
                                            </td>
                                        </tr>
                                    ))}
                                </Fragment>
                            })}
                        </Fragment>
                    })}
                </Fragment>
            })}
        </tbody>
    </table>
}
