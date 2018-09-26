'use strict';

require('dotenv').config();

const Promise = require('bluebird');
const qs = require('querystring');
const crypto = require('crypto');
const childProcess = require('child_process');
const request = Promise.promisifyAll(require('request'));

// (async () => {
//     const httpMethod = 'GET';
//     const queries = {
//         script: process.env.NS_SCRIPT_ID,
//         deploy: 1,
//         id: '2391913',
//         record_type: 'purchaseorder'
//     };

//     const oauthParams = {
//         oauth_consumer_key: process.env.CONSUMER_KEY,
//         oauth_token: process.env.TOKEN_ID,
//         oauth_nonce: childProcess.execSync('pwgen -s 16 1', { encoding: 'utf8' }).trim(),
//         oauth_timestamp: childProcess.execSync('date +%s', { encoding: 'utf8' }).trim(),
//         oauth_version: '1.0',
//         oauth_signature_method: 'HMAC-SHA256'
//     };

//     const combined = Object.assign({}, queries, oauthParams);
//     const sorted = {};
//     Object.keys(combined).sort().forEach(key => {
//         sorted[key] = combined[key] + '';
//     });

//     const baseSignature = `${httpMethod}&${qs.escape(process.env.NS_REST_BASE_URL)}&${qs.escape(qs.stringify(sorted))}`;
//     const signature = crypto.createHmac('sha256', `${process.env.CONSUMER_SECRET}&${process.env.TOKEN_SECRET}`).update(baseSignature).digest('base64');

//     const flattenParams = [`realm="${process.env.NS_ACCOUNT}"`];
//     Object.keys(oauthParams).forEach(key => {
//         flattenParams.push(`${key}="${oauthParams[key]}"`);
//     });
//     flattenParams.push(`oauth_signature="${signature}"`);

//     const authHeader = `OAuth ${flattenParams.join(',')}`;

//     const response = await request.getAsync({
//         url: process.env.NS_REST_BASE_URL,
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': authHeader
//         },
//         qs: queries,
//         json: true
//     });

//     console.log(JSON.stringify(response.body, null, 4));
// })();

(async () => {
    const response = await request.getAsync({
        url: process.env.NS_REST_BASE_URL,
        headers: {
            'Content-Type': 'application/json'
        },
        oauth: {
            signature_method: 'HMAC-SHA256',
            realm: process.env.NS_ACCOUNT,
            consumer_key: process.env.CONSUMER_KEY,
            consumer_secret: process.env.CONSUMER_SECRET,
            token: process.env.TOKEN_ID,
            token_secret: process.env.TOKEN_SECRET
        },
        qs: {
            script: process.env.NS_SCRIPT_ID,
            deploy: 1,
            id: '2391913',
            record_type: 'purchaseorder'
        },
        json: true
    });

    console.log(JSON.stringify(response.body, null, 4));
})();
