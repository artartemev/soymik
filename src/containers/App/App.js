import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import OrderForm from './../OrderForm/OrderForm'
import logo from './logo.svg'
import {ORDER_RESULT_CLOSED} from './../../modules/order'

const App = ({sentSuccess, sentFail, closePopup}) => (
    <div>
        <div className='info'>
            <div className='info__contacts'>
                <img src={logo} alt='logo' width='200' height='100' className='info__logo' />
                <p>Контакты: ‎‎‎‎‎8 952 388 5999 / zakazsoymik@yandex.ru</p>
                <p>Бухгалтерия: ‎‎‎‎8 900 649 5108 / soymikbuh@yandex.ru</p>
            </div>
            <div className='info__content'>
                <p>Заполните все поля формы.</p>
                <p>Заказы отправляются преимущественно компаниями "Байкал-Сервис" и "Деловые Линии".</p>
                <p>Размер коробки 36*36*20 см. (13-15 кг. продукции / 36 шт. колбас)</p>
                <p>Минимальный заказ - одна коробка в ассортименте.</p>
                <p>После оформления заявки в течение дня бухгалтер выставит счёт по почте.</p>
                <p>Груз отправляется в течение 1-3 рабочих дней после оплаты.</p>
                <p>Срок годности колбас 45 суток, копчушки, сосисок и тофу 30 суток, подробности <a href="http://soymik.com/assortiment"> на сайте.</a> </p>
            </div>
        </div>
        <OrderForm />
        {(sentSuccess || sentFail) &&
        <div className='popup'>
            <div className='popup__overlay' onClick={closePopup}></div>
            <div className={`popup__body ${sentSuccess ? '_success' : '_fail'}`}>
                {sentSuccess &&             

                    <div>
                        <h2>Ваш заказ успешно отправлен!</h2>
                        <p>В течение дня с вами свяжется бухгалтер для выставления счета</p>
                    </div>
                }
                {sentFail &&
                    <div>
                        <h2>Что-то пошло не так!</h2>
                        <p>Позвоните нам и уточните как прошел заказ</p>
                        <p>Контакты: 8 952 388 5999 / zakazsoymik@yandex.ru</p>
                        <p>Бухгалтерия: 8 900 649 5108 / soymikbuh@yandex.ru</p>
                    </div>
                }
                <div className='popup__ok' onClick={closePopup}><span>x</span></div>
            </div>
        </div>
        }
    </div>
)

const mapStateToProps = ({order}) => ({
    sentSuccess: order.sentSuccess,
    sentFail: order.sentFail,
})

const mapDispatchToProps = dispatch => bindActionCreators({
    closePopup: () => dispatch({
        type: ORDER_RESULT_CLOSED
    })
}, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(App)
