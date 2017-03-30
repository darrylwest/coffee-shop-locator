#!/usr/bin/env node

// dpw@seattle.local
// 2017.04.01
'use strict';

const BootStrap = require('./src/BootStrap');
const config = require('./package.json');

const app = require('express')();

// add a reference to the express app for bootstrap config
config.app = app;

// access the boot strap object and pass in config and app
// boot strap creates logging, defines the routes
new BootStrap(config).configure();

app.listen(config.port, () => {
    console.log(config.name, 'Version: ', config.version, ', listening on port:', config.port);
});

