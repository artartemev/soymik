const fs = require('fs');
const readline = require('readline');
const google = require('googleapis');
const googleAuth = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_DIR = '.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';


let oauth2Client;

const users = {
    'soymik': {
        name: 'soymik',
        spreadsheetId: '1_dMcoa-DVtQDX4OJnCq2874EXGV_x5_nzZdyD3XTMFE',
        orderListRange: "Orders!A1",
        orderFieldsSequenceSheetId: 'Orders',
        goodsSheetId: 'Goods',
        subscribersSheedId: 'Subscribers'
    }
}
const user = users.soymik;

/**
 * @param {function} options.handleAuthBadToken
 */
function start(options) {
    options = options || {};
    fs.readFile('client_secret.json', (err, content) => {
        if (err) {
            console.error('Error loading client secret file:', err);
            return;
        }
        authorize(JSON.parse(content), listSheets, options.handleAuthBadToken);
    });
}

function authorize(credentials, callback, handleAuthBadToken) {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const auth = new googleAuth();
    oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            getNewToken(oauth2Client, callback, handleAuthBadToken);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

function getNewToken(oauth2Client, callback, handleAuthBadToken) {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    if (handleAuthBadToken) {
        handleAuthBadToken(authUrl);
    }
    console.log('Authorize this app by visiting this url:', authUrl);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', code => {
        rl.close();
        getAndSaveToken(code, callback);
    });
}

function getAndSaveToken(code, callback) {
    oauth2Client.getToken(code, (err, token) => {
        if (err) {
            console.error('Error while trying to retrieve access token:', err);
            return;
        }
        oauth2Client.credentials = token;
        storeToken(token);
        if (callback) {
            callback(oauth2Client);
        }
    });
}

function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to', TOKEN_PATH);
}

function listSheets(auth) {
    const sheets = google.sheets('v4');
    sheets.spreadsheets.get({
        auth: oauth2Client,
        spreadsheetId: user.spreadsheetId,
    }, (err, response) => {
        if (err) {
            console.error('The API return an error:', err);
            return;
        }
        console.log('Sheets are fetched')
    });
}

function getFieldsSequence(callback) {
    const sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
        auth: oauth2Client,
        spreadsheetId: user.spreadsheetId,
        range: user.orderFieldsSequenceSheetId
    }, (err, response) => {
        if (err) {
            console.error('The API return an error:', err);
            callback('The API return an error:' + err, null);
            return;
        }
        const rows = response.values;
        if (rows.length === 0) {
            console.log('No data found.');
            callback('No data found.', null);
        } else {
            callback(null, rows);
        }
    });
}

/*
    @param {Array} order
*/
function addOrder(order, callback) {
    const sheets = google.sheets('v4');
    prepareOrder(order, (error, preparedOrder) => {
        const body = {
            values: [preparedOrder]
        };
        sheets.spreadsheets.values.append({
            auth: oauth2Client,
            spreadsheetId: user.spreadsheetId,
            range: user.orderListRange,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: body
        }, (err, response) => {
            if (err) {
                console.error('Error updating a sheet:', err);
            } else {
                console.log('Order saved into a sheet')
                if (callback) {
                    callback(order);
                }
            }
        });
    });
}

function prepareOrder(order, callback) {
    getFieldsSequence((error, sequence) => {
        if (error) {
            console.error('Error getting fields sequence:', error);
            callback('Error getting fields sequence:' + error, null);
            return;
        }
        const preparedOrder = sequence[0].map(field => {
            if (field === 'ts') {
                return +new Date();
            } else if (field === 'date') {
                const d = new Date();
                // dd.mm.yy hh:mm
                return `${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()-2000} ${d.getHours()}:${d.getMinutes()}`;
            } else if (order[field] !== undefined) {
                return order[field] || '';
            } else if (order.customer[field] !== undefined) {
                return order.customer[field] || '';
            } else if (order.goods[field] !== undefined) {
                return order.goods[field] || '';
            } else {
                return '';
            }
        });
        callback(null, preparedOrder);
    });
}

function getGoods(callback) {
    const sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
        auth: oauth2Client,
        spreadsheetId: user.spreadsheetId,
        range: `${user.goodsSheetId}!A1:M50`,
        valueRenderOption: 'UNFORMATTED_VALUE'
    }, (err, response) => {
        if (err) {
            console.error('The API return an error:', err);
            callback('The API return an error:' + err, null);
            return;
        }
        const rows = response.values;
        if (rows.length === 0) {
            console.log('No data found.');
            callback('No data found', null);
        } else {
            callback(null, rows);
        }
    });
}

function getSubscribers(callback) {
    const sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
        auth: oauth2Client,
        spreadsheetId: user.spreadsheetId,
        range: `${user.subscribersSheedId}!A:C`,
        // spreadsheetId: user.spreadsheetId,
        // range: `${user.goodsSheetId}!A1:M50`,
        valueRenderOption: 'UNFORMATTED_VALUE'
    }, (err, response) => {
        if (err) {
            console.error('The API return an error:', err);
            callback('The API return an error:' + err, null);
            return;
        }
        const rows = response.values;
        if (rows.length === 0) {
            console.log('No data found.');
            callback('No data found', null);
        } else {
            callback(null, rows);
        }
    });
}

function addChatId(username, chatId) {
    getSubscribers((error, rows) => {
        if (error) return console.error('Error during addChatId: Failed to get subscribers');

        let index = rows.findIndex(([_type, _username, _chatId]) => _username === username);
        if (index === -1) return;

        // Since sheets starts with A and with 1
        // and for 1 we have column names
        index += 1;

        const sheets = google.sheets('v4');
        const body = {
            values: [[chatId]]
        };
        sheets.spreadsheets.values.update({
            auth: oauth2Client,
            spreadsheetId: user.spreadsheetId,
            range: `${user.subscribersSheedId}!C${index}`,
            valueInputOption: 'RAW',
            resource: body
        }, (err, response) => {
            if (err) {
                console.error('Error updating a sheet:', err);
            } else {
                console.log('\n\nChatId added to bot notifications list\n\n')
                console.log(response)
                console.log(`${response.updatedRange} range updated.`);
            }
        });
    });
}

module.exports = {
    start,
    listSheets,
    addOrder,
    getGoods,
    getSubscribers,
    addChatId,
    getAndSaveToken,
};
