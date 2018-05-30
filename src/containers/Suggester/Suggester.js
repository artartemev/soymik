import React, {Component} from 'react'

class Suggester extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.defaultValue || '',
            highlightedIndex: -1,
            listVisible: false
        };

        this.block = `${(this.props.prefix || 'my') + '-' || ''}suggester`
        this.inputEl = `${this.block}__input`
        this.listEl = `${this.block}__list`
        this.listItemEl = `${this.block}__list-item`
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.list.length > 0 && nextProps.list.length === 0) {
            this.setState({
                highlightedIndex: -1,
                listVisible: false
            })
        } else if (this.props.list.length !== nextProps.list.length) {
            this.setState({
                highlightedIndex: 0,
                listVisible: true
            })
        }
    }
    handleKey(evt) {
        switch (evt.keyCode) {
            case 38: // up
                this.highlightIndex(
                    this.state.highlightedIndex === 0
                        ? this.props.list.length - 1
                        : this.state.highlightedIndex - 1);
                break;
            case 40: // down
                this.highlightIndex(
                    this.state.highlightedIndex === this.props.list.length - 1
                        ? 0
                        : this.state.highlightedIndex + 1);
                break;
            case 13: // enter
                if (this.state.highlightedIndex > -1) {
                    this.selectIndex(this.state.highlightedIndex);
                }
                break;
        }
    }
    highlightIndex(index) {
        this.setState({
            highlightedIndex: index
        });
    }
    selectIndex(index) {
        const newValue = this.props.list[index];
        this.setState({
            value: newValue,
            listVisible: false
        });
        this.props.onSuggestSelected(newValue);
    }
    render() {
        const {list, placeholder} = this.props;

        return (
            <div className={this.block}>
                <input className={this.inputEl}
                    type='text'
                    placeholder={placeholder}
                    value={this.state.value}
                    onKeyDown={this.handleKey.bind(this)}
                    onChange={evt => {
                        const value = evt.target.value;
                        this.setState({value});
                        this.props.onChange(value);
                    }}
                />
                <div className={`${this.listEl}${this.state.listVisible ? ' _showed' : ''}`}>
                    {list.map((item, i) => SuggesterListItem({
                        key: i,
                        selected: i === this.state.highlightedIndex,
                        className: this.listItemEl,
                        content: item,
                        onClick: this.selectIndex.bind(this, i),
                        onMouseEnter: this.highlightIndex.bind(this, i)
                    }))}
                </div>
            </div>
        )
    }
}

const SuggesterListItem = ({key, selected, className, content, onClick, onMouseEnter}) => (
    <div key={key}
        className={`${className}${selected ? ' _selected' : ''}`}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
    >
        {content}
    </div>
)

export default Suggester
