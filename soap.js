'use strict';

require('dotenv').config();

const Promise = require('bluebird');
const request = require('request');
const soap = require('soap');
const _ = require('lodash');
const S = require('string');
const xmlFormatter = require('xml-formatter');

function parseNode(prevKey, node) {
    let result = {};
    Object.keys(node).forEach(key => {
        if (key === '$attributes') {
            let parsed = parseNode(key, node[key]);
            Object.keys(parsed).forEach(attrKey => {
                result[attrKey] = parsed[attrKey];
            });
        } else {
            if (prevKey.endsWith('List') && !_.isArray(node[key]) && _.isObject(node[key])) {
                node[key] = [node[key]];
            }

            if (_.isDate(node[key])) {
                // result[key] = moment(node[key]);
                result[key] = node[key];
            } else if (_.isArray(node[key])) {
                result[key] = _.map(node[key], value => parseNode(key, value));
            } else if (_.isObject(node[key])) {
                result[key] = parseNode(key, node[key]);
            } else if (node[key] === 'true' || node[key] === 'false') {
                result[key] = S(node[key]).toBoolean();
            } else {
                let numberKeys = [
                    "cost",
                    "totalCostEstimate",
                    "estGrossProfit",
                    "estGrossProfitPercent",
                    "exchangeRate",
                    "subTotal",
                    "discountTotal",
                    "taxTotal",
                    "total",
                    "balance",
                    "giftCertApplied",
                    "quantity",
                    "rate",
                    "amount",
                    "grossAmt",
                    "line",
                    "costEstimate",
                    "quantityBackOrdered",
                    "quantityBilled",
                    "quantityCommitted",
                    "quantityFulfilled",
                    "tax1Amt",
                    "taxRate1",
                    "overdueBalance",
                    "unbilledOrders",
                    "consolUnbilledOrders",
                    "consolOverdueBalance",
                    "consolDepositBalance",
                    "depositBalance",
                    "creditLimit",
                    "consolBalance"
                ];

                if (_.indexOf(numberKeys, key) !== -1)
                    result[key] = S(node[key] + '').toFloat();
                else
                    result[key] = node[key];
            }
        }
    });

    return result;
}

(async () => {
    const client = await soap.createClientAsync('./WSDL_v2018_1_0/netsuite.wsdl', {
        attributesKey: '$attributes',
        overrideRootElement: {
            xmlnsAttributes: [{
                name: 'xmlns:platformCore',
                value: 'urn:core_2018_1.platform.webservices.netsuite.com'
            }]
        },
        request: request,
        endpoint: process.env.NS_URL
    });

    client.addSoapHeader({
        'passport': {
            'email': process.env.NS_EMAIL,
            'password': process.env.NS_PASSWORD,
            'account': process.env.NS_ACCOUNT,
            'role': {
                $attributes: {
                    'internalId': process.env.NS_ROLE
                }
            }
        },
        'applicationInfo': {
            'applicationId': process.env.NS_APPLICATION_ID,
        }
    });

    const soapClient = Promise.promisifyAll(client);
    // console.log(soapClient.describe());

    const [result, rawResponse, soapHeader, rawRequest] = await soapClient.getAsync({
        baseRef: [{
            $attributes: {
                'internalId': '2391913',
                'type': 'purchaseOrder',
                'xsi:type': 'platformCore:RecordRef',
            }
        }]
    });

    console.log(JSON.stringify(parseNode('netsuite', result), null, 4));
    // console.log(xmlFormatter(rawResponse));
    // console.log(JSON.stringify(soapHeader, null, 4));
    // console.log(xmlFormatter(rawRequest));
})();
