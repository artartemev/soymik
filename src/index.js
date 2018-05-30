import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import store from './store'

import App from './containers/App/App'

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>
    , document.getElementById('root')
)


// var goods = {
//     'Бородинская': createGood('Бородинская', 155),
//     'Питерская': createGood('Питерская', 155),
//     'Чайная': createGood('Чайная', 155),
//     'Классическая': createGood('Классическая', 140),
//     'Тыквенная': createGood('Тыквенная', 140),
//     'Шпинатная': createGood('Шпинатная', 140),
//     'Паштетная': createGood('Паштетная', 155),
//     'Гурманов': createGood('Гурманов', 160),
//     // 'Московская': createGood('Московская', price),
//     // 'Холодец': createGood('Холодец', price),
//     // 'Протеин': createGood('Протеин', price),
//     // 'Копчушка': createGood('Копчушка', price),
//     // 'Оригинальная': createGood('Оригинальная', price),
//     // 'Копчушка BBQ': createGood('Копчушка BBQ', price),
//     // 'Копчушка Карри': createGood('Копчушка Карри', price),
//     // 'Сосиски "Пикантные"': createGood('Сосиски "Пикантные"', price),
//     // 'Сосиски "Био-Дар"': createGood('Сосиски "Био-Дар"', price),
//     // 'Сосиски "Постные"': createGood('Сосиски "Постные"', price),
//     // 'Сыр Тофу': createGood('Сыр Тофу', price),
// };
// function createGood(name, price, weight, note, stop) {
//     return {
//         name: name,
//         price: price || 0,
//         weight: weight || 0,
//         note: note || '',
//         stop: stop || false,
//         orderedCount: 0
//     };
// }

// var Order = require('./order');
// var storage = require('./storage');
// var store = require('./store');
// // TODO: fetch customer fields from server and move these fields to Order
// var customerFields = ['email', 'phone', 'transport', 'name', 'city'];

// var stateCustomer = store.getState().order.customer;
// customerFields.forEach(function(field) {
//     var elem = document.querySelector('.' + field + '-input');
//     if (stateCustomer[field]) {
//         elem.value = stateCustomer[field];
//     }
// });

// fetch('/goods')
//     .then(function(res) {
//         if (res.status === 200) {
//             return res.json();
//         }
//         throw new Error('Error fetching goods: ' + res.status);
//     })
//     .then(function(goods) {
//         var formGoods = document.querySelector('.order-form__goods');
//         var order = new Order(goods, store.getState().order);
//         order.renderGoods(formGoods, order.goods);

//         store.subscribe(function() {
//             order.state = store.getState().order;
//             order.validate();
//         });

//         customerFields.forEach(function(field) {
//             var elem = document.querySelector('.' + field + '-input');
//             elem.addEventListener('keyup', function(e) {
//                 order.updateCustomer(field, elem.value);
//             });
//         });
//     })
//     .catch(function(e) {
//         console.error(e);
//     });
