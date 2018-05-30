import React from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'

import {formatWeight, formatPrice, getMeasure} from './../../utils'
import {UPDATE_GOOD, UPDATE_COMMENT} from './../../modules/order'

const GoodsForm = ({valid, goods, totalWeight, totalPrice, updateGood, updateComment}) => {
    return (
    <div className='goods-form'>
        <table>
            <tbody>
                <tr>
                    <th>Название</th>
                    <th className='goods-form__item-weight'>Вес</th>
                    <th className='goods-form__item-price'>Цена</th>
                    <th className='goods-form__item-amount'>Количество</th>
                    <th className='goods-form__item-total-weight'>Масса</th>
                    <th className='goods-form__item-total-price'>Сумма</th>
                </tr>
                <tr className='goods-form__section'><td>Товар в штуках</td></tr>
                {goods.piece.map(good => GoodItem(good, updateGood))}
                <tr className='goods-form__section'><td>
                    Товар по весу.
                    <span className="goods-form__section-note">Вес за позицию варьируется ±20 грамм</span>
                </td></tr>
                {goods.weight.map(good => GoodItem(good, updateGood))}
            </tbody>
        </table>
        <div>
            <textarea className='comment__input'
                rows='3'
                cols='50'
                maxLength='1024'
                placeholder='Комментарий к заказу'
                onChange={evt => updateComment(evt.target.value)} />
        </div>
    </div>
    )
}

const GoodItem = (good, updateGood) => !good.stop && (
    <tr key={good.id}>
        <td>
            { good.url
                ? <a href={good.url} target="_blank">{good.name}</a>
                : <span>{good.name}</span>
            }
        </td>
        <td className='goods-form__itemlWeight _nowrap'>{formatWeight(good.weight)}</td>
        <td className='goods-form__itemlPrice _nowrap'>{formatPrice(good.price, good.measure)}</td>
        <td className='goods-form-item__amount-input-wrap _nowrap'>
            <input className='goods-form-item__amount-input'
                type='text'
                placeholder='_____'
                value={good.amount || ''}
                onChange={evt => updateGood(good.id, +evt.target.value)}
            />
            <span>{getMeasure(good.measure)}</span>
        </td>
        <td className='goods-form__itemTotalWeight _nowrap'>{formatWeight(good.sumWeight, good.measure)}</td>
        <td className='goods-form__itemTotalPrice _nowrap'>{formatPrice(good.sumPrice)}</td>
    </tr>
);

const insertSectionIfNeeded = (lastMeasure, measure) => {
    return lastMeasure !== good.measure && 
        <div>{getSection(measure)}</div>
    
}

const mapStateToProps = ({order}) => ({

})

const mapDispatchToProps = dispatch => bindActionCreators({
    updateGood: (id, value) => dispatch({
        type: UPDATE_GOOD,
        id,
        value
    }),
    updateComment: text => dispatch({
        type: UPDATE_COMMENT,
        text
    }),
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(GoodsForm)
