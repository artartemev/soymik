const sheet = require('./sheet')
const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const Telegraf = require('telegraf')

const MAPS_API_KEY = 'AIzaSyBcTi1SqycSFiN2VASBVQ3r4SuXp_cfP7g'
const googleMaps = require('@google/maps').createClient({
    key: MAPS_API_KEY,
    Promise: Promise
})

const VEGANOVBOT_KEY = '522075026:AAEqawpt6P-oeNqfSZdkxVFOGSkHmzIoXYs'
const bot = new Telegraf(VEGANOVBOT_KEY)
bot.command('start', (ctx) => {
    sheet.addChatId(ctx.from.username, ctx.chat.id);
    return ctx.reply('Здравствуйте, если вы есть таблице Subscribers, отныне я буду присылать вам уведомления о новых заказах. С вами приятно иметь дело.');
});
bot.command('help', (ctx) => ctx.reply('Try send a sticker!'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.startPolling()
const handleAuthBadToken = (authUrl) => {
    const vaganovChatId = 430444167;
    const drzhbeChatId = 73516880;
    [vaganovChatId, drzhbeChatId].forEach(chatId => {
        bot.telegram.sendMessage(chatId, `
Пожар!
Гугль Авторизация на сервере протухла.
1. Пройди по ссылке ${authUrl}
2. Возьми оттуда код
3. Пройди по ссылке https://veganov.herokuapp.com/getToken/КОД_С_ПРОШЛОЙ_СТРАНИЦЫ

Все должно заработать.
        `);
    });
};


const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/order', (req, res) => {
    const {order} = req.body;
    console.log('\nTrying to save order into a sheet:\n', order);
    sheet.addOrder(order, () => {
        // rows: [ ['type', 'username', 'chatId'], [x, y, z], ... ]
        sheet.getSubscribers((error, rows) => {
            const orderString = `
Ура, новый заказ!
Плательщик: ${order.customer.payer}
Телефон: ${order.customer.phone}
Город: ${order.customer.city}
ТК: ${order.customer.transport}
Масса: ${order.totalWeight} кг
Цена: ${order.totalPrice} ₽
            `;
            rows.shift();
            rows.forEach(([type, username, chatId]) => {
                chatId
                && type === "super"
                // TODO (drzhbe): if user blocked the bot, delete him from the table Subscribers
                // e.code === 403
                && bot.telegram.sendMessage(chatId, orderString).catch(e => console.error(e));
            });
        })
    });
    res.send('OK')
});

app.get('/goods', (req, res) => {
    sheet.getGoods(function(error, data) {
        if (error) {
            res.status(500).send(error);
            return;
        }

        const [fieldList, fieldTypes, ...goodsRaw] = data;
        const goods = {};
        goodsRaw.forEach(goodArray => {
            const good = {};
            fieldList.forEach((field, i) => {
                good[field] = format(goodArray[i], fieldTypes[i]);
            });
            goods[good.id] = good;
        });

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(goods));
    });
});

app.get('/getToken/:code', (req, res) => {
    const code = req.params.code;
    sheet.getAndSaveToken(code);
    // TODO (drzhbe): Not quite OK. Should check `sheet.getAndSaveToken` result.
    res.send('OK');
});

app.get('/place_autocomplete/:input', (req, res) => {
    const input = req.params.input;

    googleMaps.placesAutoComplete({input, types: '(cities)'}).asPromise()
        .then(placeRes => {
            if (placeRes.status !== 200) {
                throw new Error(placeRes.error_message);
            }
            // console.log('Predictions fetched:', placeRes.json.predictions);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(placeRes.json.predictions));
        })
        .catch(e => { res.status(500).send({error: `Error fetching autocomplete: ${e}`}) })
})

app.get('/organization_autocomplete/:query', (req, res) => {
    const query = req.params.query;

    axios.post('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party', {
        // query
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Token 5b380f234cec0c4532bfc76b736048c05a90e032'
        },
        data: { query }
    })
        .then(suggestionsRes => {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(suggestionsRes.data.suggestions));
        })
        .catch(e => console.error('Error during autocomplete from dadata:', e))
    
})

function format(value, type) {
    if (value === undefined) {
        return getDefaultValueForType(type);
    }
    switch (type) {
        case 'number':
            return +value;
        case 'bool':
            return !!value;
        case 'string':
        default:
            return value;
    }
}

function getDefaultValueForType(type) {
    switch (type) {
        case 'number':
            return 0;
        case 'bool':
            return false;
        case 'string':
        default:
            return '';
    }
}

const port = process.env.PORT || 3000
app.listen(port, () => console.log('Sheet app listening on port ' + port));
sheet.start({ handleAuthBadToken });
