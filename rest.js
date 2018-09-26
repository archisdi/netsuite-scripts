'use strict';

require('dotenv').config();

const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));

(async () => {
    const response = await request.getAsync({
        url: process.env.NS_REST_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': process.env.NS_AUTH
        },
        qs: {
            script: process.env.NS_SCRIPT_ID_V1,
            deploy: 1,
            id: '2391913',
            record_type: 'purchaseorder'
        },
        json: true
    });

    console.log(JSON.stringify(response.body, null, 4));
})();
