import React from 'react'
import {connect} from 'react-redux'
import { UPDATE_CUSTOMER } from '../../modules/order'
import CityField from './../CityField/CityField'
import RadioGroup from './../RadioGroup/RadioGroup'

const CustomerForm = (props) => (
    <div className='customer-form'>
        <div className='customer-form-section ._payer'>
            {props.payer.map((field, i) => !field.hidden && (
                <div className='customer-form-item' key={i}>
                    <div className='customer-form-item__label'>{field.label}</div>
                    {renderField(field, props.updateCustomer)}
                </div>
            ))}
        </div>
        <div className='customer-form-section ._recipient'>
            {props.recipient.map((field, i) => !field.hidden && (
                <div className='customer-form-item' key={i}>
                    <div className='customer-form-item__label'>{field.label}</div>
                    {renderField(field, props.updateCustomer)}
                </div>
            ))}
        </div>
    </div>
)

const renderField = (field, updateCustomer) => {
    if (field.type === 'radio') {
        // If there is no value found use last element, coz its supposed to be "other" option
        let activeIndex = field.variants.findIndex(item => item.value === field.value)
        if (activeIndex === -1) {
            activeIndex = field.variants.length - 1;
        }
        return (
            <RadioGroup
                blockName='customer-form-item'
                items={field.variants.map(item => ({
                    ...item,
                    img: item.hasOwnProperty('img') && item.img || undefined
                }))}
                activeIndex={activeIndex}
                onClick={i => updateCustomer(field.name, field.variants[i].value)}
            />
        )
    } else if (field.name === 'city') {
        return (
            <CityField value={field.value}
                onChange={val => updateCustomer(field.name, val)}
            />
        )
    } else {
        return (
            <input className={`customer-form-item__input _${field.name}`}
                type='text'
                placeholder={field.placeholder}
                value={field.value}
                onChange={evt => updateCustomer(field.name, evt.target.value)}
            />
        )
    }
}

const mapStateToProps = ({order}) => ({

})

const mapDispatchToProps = dispatch => ({
    updateCustomer: (field, value) => dispatch({
        type: UPDATE_CUSTOMER,
        field,
        value
    })
})

export default connect(mapStateToProps, mapDispatchToProps)(CustomerForm)
