import React from 'react'

const RadioGroup = ({blockName, items, activeIndex, onClick}) => (
    <div className={blockName + '__radio-group'}>
        {items.map((item, i) => (
            item.img
                ? <div key={i}
                    className={`${blockName}__radio-item${activeIndex === i ? ' _active' : ''} _${item.id} _img`}
                    onClick={() => onClick(i)}
                ><div className={blockName + '__radio-img'}></div></div>
                : <div key={i}
                    className={`${blockName}__radio-item${activeIndex === i ? ' _active' : ''}`}
                    onClick={() => onClick(i)}
                >
                    {item.label}
                </div>
        ))}
    </div>
)

export default RadioGroup
