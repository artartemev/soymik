import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
// import XLSX from 'xlsx'

import {formatWeight, formatPrice} from './../../utils'
import CustomerForm from './../CustomerForm/CustomerForm'
import GoodsForm from './../GoodsForm/GoodsForm'
import {dispatch} from './../../store'
import {GOODS_FETCHED, UPDATE_GOODS_FROM_XLSX, sendOrder} from './../../modules/order'

class OrderForm extends Component {
    componentWillMount() {
        fetch('/goods')
            .then(function(res) {
                if (res.status === 200) {
                    return res.json();
                }
                throw new Error('Error fetching goods: ' + res.status);
            })
            .then(this.props.goodsFetched)
            .catch(e => console.error(e));
    }
    render() {
        const {valid, customer, goods, totalWeight, totalPrice, updateGoodsFromXlsx, sendOrder} = this.props;
        const createOrderButtonAttr = {disabled: !valid};
        return (
            <div className='order-form'>
                <CustomerForm
                    payer={Object.keys(customer)
                        .filter(key => customer[key].section === 'payer')
                        .map(key => customer[key])
                    }
                    recipient={Object.keys(customer)
                        .filter(key => customer[key].section === 'recipient')
                        .map(key => customer[key])
                    }
                />
                {/* <input type='file' onChange={evt => selectFiles(evt.target.files, updateGoodsFromXlsx)}/> */}
                <GoodsForm
                    valid={valid}
                    goods={{
                        piece: Object.keys(goods)
                            .filter(goodId => goods[goodId].measure === 'piece')
                            .map(goodId => goods[goodId]),
                        weight: Object.keys(goods)
                            .filter(goodId => goods[goodId].measure === 'weight')
                            .map(goodId => goods[goodId])
                    }}
                    totalWeight={totalWeight}
                    totalPrice={totalPrice}
                />
                <div className='goods-form__total-wrap'>
                    <div className='goods-form__total'>
                    <span className='_noselect'>{totalWeight || totalPrice ? 'Итого' : ''}</span>
                    <span className='_nowrap'>{formatWeight(totalWeight)}</span>
                    <span className='_nowrap'>{formatPrice(totalPrice)}</span>
                    <span className='_noselect'>
                        <button className='create-order' {...createOrderButtonAttr}
                            onClick={sendOrder}>
                            Заказать
                        </button>
                    </span>
                    </div>
                </div>
            </div>
        )
    }
}

// const selectFiles = (files, updateGoodsFromXlsx) => {
    // const file = files[0];
    // const reader = new FileReader();
    // const rABS = reader.readAsBinaryString;
    // reader.onload = evt => {
    //     let data = evt.target.result;
    //     if (!rABS) data = new Uint8Array(data);
    //     const workbook = XLSX.read(data, {type: rABS ? 'binary' : 'array'});
    //     const sheet = workbook && workbook.Sheets && workbook.Sheets['Лист1'];
    //     console.log('WORKBOOK', sheet);
        
    //     if (sheet) {
    //         let nameColumn = 'C';
    //         let valueColumn = 'F';
    //         const order = [];
    //         let headerPassed = false;

    //         // "Soyka" use their own table for orders
    //         if (sheet.A1 && sheet.A1.v.indexOf('Сойка') !== -1) {
    //             nameColumn = 'A';
    //             valueColumn = 'C';
    //             for (let key in sheet) {
    //                 if (key.startsWith(nameColumn)) {
    //                     if (!headerPassed && key === 'A6') {
    //                         headerPassed = true;
    //                     } else {
    //                         const index = key.slice(1);
    //                         const value = sheet[valueColumn + index].v;
    //                         if (value) {
    //                             order.push({
    //                                 name: sheet[key].v,
    //                                 value
    //                             });
    //                         }
    //                     }
    //                 }
    //             }
    //         } else {
    //             for (let key in sheet) {
    //                 if (key.startsWith(nameColumn)) {
    //                     if (!headerPassed) {
    //                         headerPassed = true;
    //                     } else {
    //                         const index = key.slice(1);
    //                         const value = sheet[valueColumn + index].v;
    //                         if (value) {
    //                             order.push({
    //                                 name: sheet[key].v,
    //                                 value
    //                             });
    //                         }
    //                     }
    //                 }
    //             }
    //         }

    //         updateGoodsFromXlsx(order);
    //     }
    // }

    // if (rABS) {
    //     reader.readAsBinaryString(file);
    // } else {
    //     reader.readAsArrayBuffer(file);
    // }
// }

const mapStateToProps = ({order}) => ({
    valid: order.valid,
    customer: order.customer,
    goods: order.goods,
    totalWeight: order.totalWeight,
    totalPrice: order.totalPrice
})

const mapDispatchToProps = dispatch => bindActionCreators({
    goodsFetched: (goods) => dispatch({
        type: GOODS_FETCHED,
        goods
    }),
    updateGoodsFromXlsx: order => dispatch({
        type: UPDATE_GOODS_FROM_XLSX,
        order
    }),
    sendOrder
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(OrderForm)
