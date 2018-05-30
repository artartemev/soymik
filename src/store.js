import {createStore, combineReducers, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import order from './modules/order'

const middleware = [
    thunk
]

export default createStore(
    combineReducers({
        order
    }),
    {},
    compose(applyMiddleware(...middleware))
);
