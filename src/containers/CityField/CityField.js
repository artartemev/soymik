import React, {Component} from 'react'
import {arrayUnique} from './../../utils'
import Suggester from './../Suggester/Suggester'


class CityField extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
    }
    render() {
        const {onChange} = this.props;
        return (
            <Suggester
                prefix='city'
                fetching={false}
                list={this.state.list}
                defaultValue={this.props.value}
                onSuggestSelected={this.props.onChange}
                onChange={
                    (input) => {
                        if (!input) {
                            this.props.onChange(input);
                            this.setState({list: []});
                            return;
                        }

                        this.props.onChange(input);

                        fetch(`/place_autocomplete/${input}`)
                            .then(res => {
                                if (res.status === 200) {
                                    return res.json();
                                }
                                throw new Error('Error fetching autocomplete: ' + res.status);
                            })
                            .then(predictions => {
                                this.setState({list: predictions
                                    .map(item => (
                                        item.structured_formatting.main_text === 'Москова'
                                            ? 'Москва'
                                            : item.structured_formatting.main_text
                                    ))
                                    .filter(arrayUnique)
                                })
                            })
                            .catch(e => { console.error(e) })
                    }
                }
            />
        )
    }
}

export default CityField
