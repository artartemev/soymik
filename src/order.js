var storage = require('./storage');
var store = require('./store');
var orderReducer = require('./orderReducer');

function Order(goods, state) {
    this.goods = goods;
    this.goodSumElements = {};
    this.totalSumElements = {
        weight: undefined,
        price: undefined
    };
    this.orderButton;
    this.state = state;
}

Order.prototype.renderGoods = function(parent, goods) {
    var frag = document.createDocumentFragment();
    // render sum before goods because goods will trigger some update if
    // state was stored in localStorage
    var sum = this.renderSum();
    var section;
    for (var goodId in goods) {
        if (!goods[goodId].stop) {
            if (section !== goods[goodId].measure) {
                section = goods[goodId].measure;
                var sec = document.createElement('div');
                sec.classList.add('order-form__goods-section');
                sec.innerHTML = section === 'piece'
                    ? 'Товар в штуках'
                    : 'Товар по весу. <span class="order-form__goods-section-note">Вес за позицию варьируется ±20 грамм</span>'
                frag.appendChild(sec);
            }
            frag.appendChild(
                this.renderGood(
                    goods[goodId],
                    store.getState().order.goods[goodId]
                )
            );
        }
    }
    frag.appendChild(sum);

    var table = document.createElement('table');
    var tbody = document.createElement('tbody');

    var headers = document.createElement('tr');
    ['Название', 'Вес', 'Цена', 'Количество', 'Масса', 'Сумма']
        .map(function(label) {
            var th = document.createElement('th');
            th.textContent = label;
            headers.appendChild(th);
        });

    tbody.appendChild(headers);
    tbody.appendChild(frag);
    table.appendChild(tbody);

    parent.appendChild(table);
    parent.appendChild(this.renderOrderButton());
};

Order.prototype.renderGood = function(good, value) {
    var elem = document.createElement('tr');

    var label = document.createElement('td');
    label.textContent = good.name;

    var price = document.createElement('td');
    price.classList.add('_nowrap');
    price.textContent = this.formatPrice(good.price);

    var weight = document.createElement('td');
    weight.classList.add('_nowrap');
    weight.textContent = this.formatWeight(good.weight);

    var sumWeight = document.createElement('td');
    sumWeight.classList.add('_nowrap');
    sumWeight.classList.add('order-item__sum-weight');

    var sumPrice = document.createElement('td');
    sumPrice.classList.add('_nowrap');
    sumPrice.classList.add('order-item__sum-price');

    // fill sum elements before create inputs
    // cuz input can trigger updateSum in we have stored state
    this.goodSumElements[good.id] = {weight: sumWeight, price: sumPrice};

    var self = this;
    var input = document.createElement('td');
    input.classList.add('order-item__amount-input-wrap');
    var _inp = document.createElement('input');
    _inp.classList.add('order-item__amount-input');
    _inp.setAttribute('type', 'text');
    _inp.setAttribute('placeholder', '_____');
    _inp.addEventListener('keyup', function(e) {
        console.log(good.name, _inp.value);
        self.updateGoods(good.id, +_inp.value);
    });
    if (value) {
        _inp.value = value;
        this.updateGoods(good.id, +value);
    }
    var _measure = document.createElement('span');
    _measure.textContent = good.measure === 'piece'
        ? 'шт'
        : 'кг';
    input.appendChild(_inp);
    input.appendChild(_measure);

    if (good.orderedCount) {
        input.value = good.orderedCount;
    }

    elem.appendChild(label);
    elem.appendChild(weight);
    elem.appendChild(price);
    elem.appendChild(input);
    elem.appendChild(sumWeight);
    elem.appendChild(sumPrice);
    
    return elem;
};

Order.prototype.renderSum = function() {
    var elem = document.createElement('tr');
    for (var i = 0; i < 6; i++) {
        var td = document.createElement('td');
        if (i === 0) {
            td.textContent = 'Итого';
        } else if (i === 4) {
            this.totalSumElements.weight = td;
            td.classList.add('order__sum-weight', '_nowrap');
        } else if (i === 5) {
            this.totalSumElements.price = td;
            td.classList.add('order__sum-price', '_nowrap');
        }
        elem.appendChild(td);
    }
    return elem;
};

Order.prototype.renderOrderButton = function() {
    var button = document.createElement('button');
    // button.setAttribute('disabled', true);
    button.classList.add('create-order');
    button.textContent = 'Заказать';
    button.addEventListener('click', function(e) {
        var body = {order: store.getState().order};
        fetch('/order', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(body)
        })
            .then(function(res) {
                if (res.status === 200) {
                    return res.text();
                }
                throw new Error('Error posting new order: ' + res.status);
            })
            .then(function(text) {
                console.log('New order created:', text);
                storage.remove('order-goods');
            })
            .catch(function(e) {
                console.error(e);
            });
    });
    this.orderButton = button;
    return button;
}

Order.prototype.validate = function() {
    var allCustomerFieldsFilled = true;
    for (var field in this.state.customer) {
        if (!this.state.customer[field]) {
            allCustomerFieldsFilled = false;
        }
    }

    if (this.state.valid && !allCustomerFieldsFilled) {
        store.dispatch({
            type: orderReducer.SET_VALID,
            value: false
        });
        return;
    }

    var anyGoodOrdered = false;
    for (var goodId in this.state.goods) {
        if (this.state.goods[goodId]) {
            anyGoodOrdered = true;
        }
        if (anyGoodOrdered) {
            break;
        }
    }

    var isValid = allCustomerFieldsFilled && anyGoodOrdered;

    if ((this.state.valid && !isValid) ||
        (!this.state.valid && isValid))
    {
        store.dispatch({
            type: orderReducer.SET_VALID,
            value: isValid
        });
    }
};

Order.prototype.updateCustomer = function(field, value) {
    store.dispatch({
        type: orderReducer.UPDATE_CUSTOMER,
        field: field,
        value: value
    });
    storage.set('order-customer', store.getState().order.customer);
};

Order.prototype.updateGoods = function(goodId, value) {
    store.dispatch({
        type: orderReducer.UPDATE_GOOD,
        goodId: goodId,
        value: value
    });
    storage.set('order-goods', store.getState().order.goods);

    this.updateGoodSum(goodId);
};

Order.prototype.updateGoodSum = function(goodId) {
    var sumWeight = this.calcSum(goodId, 'weight');
    var sumPrice = this.calcSum(goodId, 'price');
    this.goodSumElements[goodId].weight.textContent = this.formatWeight(sumWeight);
    this.goodSumElements[goodId].price.textContent = this.formatPrice(sumPrice);
    this.updateTotalSum();
};

Order.prototype.updateTotalSum = function() {
    var sumWeight = 0;
    var sumPrice = 0;
    var state = store.getState().order;
    for (var id in state.goods) {
        sumWeight += this.calcSum(id, 'weight');
        sumPrice += this.calcSum(id, 'price');
    }
    this.totalSumElements.weight.textContent = this.formatWeight(sumWeight);
    this.totalSumElements.price.textContent = this.formatPrice(sumPrice);
};

Order.prototype.calcSum = function(goodId, field) {
    var amount = this.state.goods[goodId];
    var good = this.goods[goodId];
    if (good.measure === 'weight' && field === 'weight') {
        return amount;
    }
    return amount * good[field];
};

Order.prototype.formatWeight = function(weight) {
    // +x.toFixed(2) protects us from 0.4 * 3 = 1.2000000000000002
    return weight === 0
        ? ''
        : weight > 1
            ? +weight.toFixed(2) + ' кг'
            : +weight.toFixed(2) * 1000 + ' г';
};

Order.prototype.formatPrice = function(price) {
    return price === 0
        ? ''
        : price + ' ₽';
};

Order.prototype.render = () => (
    <div>Hello</div>
)

module.exports = Order;
