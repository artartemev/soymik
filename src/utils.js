export const mapObject = (o, reducer) => (
    Object.keys(o)
        .map(key => o[key])
        .reduce(reducer, {})
)

export const arrayUnique = (value, index, self) => self.indexOf(value) === index;

export const getMeasure = measure => (
    measure === 'piece'
        ? 'шт'
        : 'шт'
)

// +x.toFixed(2) protects us from 0.4 * 3 = 1.2000000000000002
export const formatWeight = (weight, measure) => (
    !weight
        ? ''
        : weight >= 1
            ? +weight.toFixed(1) + ' кг'
            : +weight.toFixed(2) * 1000 + ' г'
)

export const formatPrice = (price, measure) => (
    !price
        ? ''
        : measure && measure === 'weight'
            ? price + ' ₽/кг'
            : price + ' ₽'
)
