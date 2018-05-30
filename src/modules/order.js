import storage from './../storage'

export const UPDATE_CUSTOMER = 'order/UPDATE_CUSTOMER'
export const UPDATE_GOOD = 'order/UPDATE_GOOD'
export const GOODS_FETCHED = 'order/GOODS_FETCHED'
export const SET_VALID = 'order/SET_VALID'
export const CLEAR_GOODS_AMOUNTS = 'order/CLEAR_GOODS_AMOUNTS'
export const UPDATE_COMMENT = 'order/UPDATE_COMMENT'
export const UPDATE_GOODS_FROM_XLSX = 'order/UPDATE_GOODS_FROM_XLSX'
export const ORDER_SENT_SUCCESS = 'order/ORDER_SENT_SUCCESS'
export const ORDER_SENT_FAIL = 'order/ORDER_SENT_FAIL'
export const ORDER_RESULT_CLOSED = 'order/ORDER_RESULT_CLOSED'


/*
    All customer fields should be filled.
    One of the goods amount should be filled
*/
const isValid = state => {
    for (let key in state.customer) {
        if (!state.customer[key].value && !state.customer[key].optional) {
            if (key === 'passport') {
                if (state.customer.type.value === 'person') {
                    return false;
                }
            } else if (key === 'inn') {
                if (state.customer.type.value === 'organization') {
                    return false;
                }
            } else {
                return false;
            }
        }
    }

    for (let goodId in state.goods) {
        if (state.goods[goodId].amount) {
            return true;
        }
    }

    return false;
}

const calcTotals = goods => {
    let totalWeight = 0;
    let totalPrice = 0;
    for (let id in goods) {
        totalWeight += goods[id].sumWeight || 0;
        totalPrice += goods[id].sumPrice || 0;
    }
    totalWeight = safeNumber(totalWeight);
    totalPrice = safeNumber(totalPrice);
    return {totalWeight, totalPrice};
}

// get rid of 562.4 + 1028.8 = 1591.1999999999998
const safeNumber = n => Math.round(n * 100) / 100;

const customerValues = storage.get('order-customer')

const initialState =  {
    sentSuccess: false,
    sentFail: false,
    valid: false,
    customer: {
        payer: {
            section: 'payer',
            name: 'payer',
            label: 'Плательщик',
            placeholder: 'ФИО',
            value: customerValues
                && customerValues.payer
                && customerValues.payer.value || ''
        },
        email: {
            section: 'payer',
            name: 'email',
            label: 'Email',
            placeholder: 'example@example.com',
            value: customerValues
                && customerValues.email
                && customerValues.email.value || ''
        },
        phone: {
            section: 'payer',
            name: 'phone',
            label: 'Телефон',
            placeholder: '+7...',
            value: customerValues
                && customerValues.phone
                && customerValues.phone.value || ''
        },
        type: {
            section: 'recipient',
            name: 'type',
            type: 'radio',
            label: 'Получатель',
            variants: [
                {value: 'organization', label: 'Юр лицо'},
                {value: 'person', label: 'Физ лицо'},
            ],
            value: customerValues
                && customerValues.type
                && customerValues.type.value || 'organization'
        },
        name: {
            section: 'recipient',
            name: 'name',
            label: 'Название',
            placeholder: 'ООО/ИП Название',
            value: customerValues
                && customerValues.name
                && customerValues.name.value || ''
        },
        inn: {
            section: 'recipient',
            name: 'inn',
            label: 'ИНН',
            placeholder: 'ИНН',
            value: customerValues
                && customerValues.inn
                && customerValues.inn.value || ''
        },
        passport: {
            section: 'recipient',
            name: 'passport',
            label: 'Паспорт',
            placeholder: 'Серия и номер',
            value: customerValues
                && customerValues.passport
                && customerValues.passport.value || '',
            hidden: true
        },
        city: {
            section: 'recipient',
            name: 'city',
            label: 'Город',
            placeholder: 'Город',
            value: customerValues
                && customerValues.city
                && customerValues.city.value || ''
        },
        transport: {
            section: 'recipient',
            type: 'radio',
            name: 'transport',
            label: 'Транспортная компания',
            variants: [
                {id: 'baikal', img: true, value: 'Байкал Сервис', label: 'Байкал Сервис'},
                {id: 'linii', img: true, value: 'Деловые Линии', label: 'Деловые Линии'},
                {value: 'Другое', label: 'Другие ТК (от 50 кг)'}
            ],
            value: customerValues
                && customerValues.transport
                && customerValues.transport.value || 'Байкал Сервис'
        },
        transportOther: {
            section: 'recipient',
            optional: true,
            name: 'transportOther',
            label: 'До терминалов других ТК за наш счёт доставляем при заказе от 50 кг',
            placeholder: 'ТК',
            value: customerValues
                && customerValues.transport
                && customerValues.transport.value !== 'Байкал Сервис'
                && customerValues.transport.value !== 'Деловые Линии'
                && customerValues.transport.value || '',
            hidden: customerValues
                ? customerValues.transport
                    && (customerValues.transport.value === 'Байкал Сервис'
                        || customerValues.transport.value === 'Деловые Линии')
                : true
        }
    },
    goods: storage.get('order-goods') || {},
    comment: '',
    totalWeight: 0,
    totalPrice: 0
};
initialState.valid = isValid(initialState);
Object.assign(initialState, calcTotals(initialState.goods));

export default (state = initialState, action) => {
    let newGoods, newState;
    switch(action.type) {
        case UPDATE_CUSTOMER:
            if (action.field === 'city') {
                fetchCityAutocomplete(action.value);
            }
            // if (action.field === 'name') {
            //     fetchOrganizationAutocomplete(action.value);
            // }

            let typeDependentFields = {};
            if (action.field === 'type') {
                typeDependentFields = {
                    name: {
                        ...state.customer.name,
                        label: action.value === 'organization'
                            ? 'Название'
                            : 'ФИО',
                        placeholder: action.value === 'organization'
                            ? 'ООО Название'
                            : 'Фамилия Имя Отчество'
                    },
                    inn: {
                        ...state.customer.inn,
                        hidden: action.value !== 'organization'
                    },
                    passport: {
                        ...state.customer.passport,
                        hidden: action.value === 'organization'
                    }
                }
            }

            let transportDependentFields = {};
            if (action.field === 'transport') {
                transportDependentFields = {
                    transportOther: {
                        ...state.customer.transportOther,
                        hidden: action.value === 'Байкал Сервис'
                            || action.value === 'Деловые Линии'
                    }
                }
            }

            if (action.field === 'transportOther') {
                transportDependentFields = {
                    transport: {
                        ...state.customer.transport,
                        value: action.value
                    }
                }
            }

            newState = {
                ...state,
                customer: {
                    ...state.customer,
                    ...typeDependentFields,
                    ...transportDependentFields,
                    [action.field]: {
                        ...state.customer[action.field],
                        value: action.value
                    }
                }
            }
            newState.valid = isValid(newState);

            storage.set('order-customer', newState.customer);

            return newState;
        case UPDATE_GOOD:
            const good = Object.assign({}, state.goods[action.id]);
            good.amount = action.value;
            good.sumWeight = good.measure === 'weight'
                ? safeNumber(good.amount * good.weight)
                : safeNumber(good.amount * good.weight);
            good.sumPrice = good.measure === 'weight'
                ? safeNumber(good.amount * good.price * good.weight)
                : safeNumber(good.amount * good.price);

            newGoods = {
                ...state.goods,
                [good.id]: good
            };

            const {totalWeight, totalPrice} = calcTotals(newGoods);

            newState = {
                ...state,
                totalWeight,
                totalPrice,
                goods: newGoods
            };
            newState.valid = isValid(newState);

            storage.set('order-goods', newState.goods);

            return newState;
        case UPDATE_COMMENT:
            return {
                ...state,
                comment: action.text
            };
        case UPDATE_GOODS_FROM_XLSX:
            // TODO associate goods from action.order array
            // with ids from state.order.goods

            // action.order
            return state;
        case GOODS_FETCHED:
            const oldGoods = state.goods;
            // goods came as plain object, we categorize them between piece & weight
            newGoods = {};
            for (let key in action.goods) {
                const good = action.goods[key];
                const newGood = newGoods[key] = oldGoods[key]
                    ? Object.assign({}, oldGoods[key], good)
                    : good;
                if (newGood.amount === undefined) {
                    newGood.amount = 0;
                }
                if (newGood.sumWeight === undefined) {
                    newGood.sumWeight = 0;
                }
                if (newGood.sumPrice === undefined) {
                    newGood.sumPrice = 0;
                }
            }
            return {
                ...state,
                goods: newGoods
            };
        case ORDER_SENT_SUCCESS:
        console.log('SUCCESS')
            return {
                ...clearGoods(state),
                sentSuccess: true
            };
        case ORDER_SENT_FAIL:
        console.log('FAIL')
            return {
                ...state,
                sentFail: true
            };
        case ORDER_RESULT_CLOSED:
            return {
                ...state,
                sentSuccess: false,
                sentFail: false
            };
        case CLEAR_GOODS_AMOUNTS:
            return {
                ...state,
                valid: false,
                totalWeight: 0,
                totalPrice: 0,
                goods: Object.keys(state.goods)
                    .map(goodId => ({
                        ...state.goods[goodId],
                        amount: 0,
                        sumWeight: 0,
                        sumPrice: 0,
                        valid: false
                    }))
                    .reduce((result, good) => (result[good.id] = good, result), {})
            };
        case SET_VALID:
            state.status = action.value;
            return state;
        default:
            return state;
    }
}

export const sendOrder = () => {
    return (dispatch, getState) => {
        const state = getState().order;
        const body = {order: {
            customer: Object.keys(state.customer)
                .map(fieldName => state.customer[fieldName])
                .reduce((result, field) => (result[field.name] = field.value, result), {}),
            goods: Object.keys(state.goods)
                .map(goodId => state.goods[goodId])
                .reduce((result, good) => {
                    result[good.id] = good.measure === 'piece'
                        ? good.amount
                        : good.amount * good.weight
                    return result;
                }, {}),
            comment: state.comment,
            totalWeight: state.totalWeight,
            totalPrice: state.totalPrice
        }};
        fetch('/order', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(body)
        })
            .then(res => {
                if (res.status === 200) {
                    return res.text();
                }
                throw new Error('Error posting new order: ' + res.status);
            })
            .then(text => {
                // TODO show success msg to the user
                console.log('New order created:', text);
                storage.remove('order-goods');
                dispatch({type: ORDER_SENT_SUCCESS})
            })
            .catch(e => {
                dispatch({type: ORDER_SENT_FAIL})
                console.error(e);
            });
    }
}

const clearGoods = (state) => ({
    ...state,
    valid: false,
    totalWeight: 0,
    totalPrice: 0,
    goods: Object.keys(state.goods)
        .map(goodId => ({
            ...state.goods[goodId],
            amount: 0,
            sumWeight: 0,
            sumPrice: 0,
            valid: false
        }))
        .reduce((result, good) => (result[good.id] = good, result), {})
});

const fetchCityAutocomplete = (input) => {
    return (dispatch, getState) => {
        dispatch({type: FETCH_CITY_AUTOCOMPLETE});

        fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&types=(cities)&key=${API_KEY}`)
            .then(res => {
                if (res.status === 200) {
                    return res.text();
                }
                throw new Error('Error posting new order: ' + res.status);
            })
            .then(res => {
                console.log('Predictions fetched:', res.predictions);
                dispatch({type: CITY_AUTOCOMPLETE_FETCHED, list: res.predictions})
            })
            .catch(e => { console.error(e) });
    }
}

const fetchOrganizationAutocomplete = query => {
    fetch(`/organization_autocomplete/${query}`)
        .then(res => {
            if (res.status === 200) {
                return res.text();
            }
            throw new Error('Error posting new order: ' + res.status);
        })
        .then(data => {
            console.log('Names:', data);
        })
        .catch(e => {
            console.error(e);
        });
}
