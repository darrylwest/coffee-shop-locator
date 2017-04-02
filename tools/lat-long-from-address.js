#!/usr/bin/env node

// dpw@seattle.local
// 2017.03.30
'use strict';

const https = require('https');
// const address='535 Mission St, San Francisco, CA 94105';
// const address='50 Fremont St, San Francisco, CA 94105';
// const address='2101 Sutter St, San Francisco, CA,'; //  94115';
// const address='252 Guerrero St, San Francisco, CA 94103, USA';
const address='199 Freemont St, San Francisco, CA';

const opts = {
    method: 'GET',
    port: 443,
    hostname: 'maps.googleapis.com',
    path: `/maps/api/geocode/json?address=${escape(address)}`
};

const chunks = [];
const errors = [];
const req = https.request(opts, (res) => {
    // console.log('status code:', res.statusCode);
    // console.log('headers:', res.headers);

    res.on('data', (data) => {
        chunks.push(data.toString());
        // console.log(data);
    });
});


req.on('error', (err) => {
    console.log(err);
    errors.push(err);
});

req.on('close', () => {
    console.log('conn closed...');

    const message = chunks.join('');

    const obj = JSON.parse(message);
    if (obj.status === 'OK') {
        const result = obj.results.pop();
        console.log(result.formatted_address);
        console.log(result.geometry.location);
    } else {
        console.log(message);
    }

});

req.end();

