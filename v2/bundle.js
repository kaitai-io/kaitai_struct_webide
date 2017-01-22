var path = require("path");
var Builder = require('systemjs-builder');

// optional constructor options
// sets the baseURL and loads the configuration file
var builder = new Builder('./', 'config.js');

var libs = [
    'aurelia-framework',
    'aurelia-bootstrapper',
    'aurelia-pal-browser',
    'npm:aurelia-templating-resources@1.2.0',
    'npm:aurelia-loader-default@1.0.0',
    'npm:aurelia-logging-console@1.0.0',
    'npm:aurelia-templating-binding@1.2.0',
    'npm:aurelia-event-aggregator@1.0.1',
    'npm:aurelia-history-browser@1.0.0',
    'npm:aurelia-history@1.0.0',
    'npm:aurelia-templating-router@1.0.1',
];

builder.bundle(libs.join(' + '), 'aurelia.js').then(() => console.log('Build complete')).catch(err => console.log('Build error', err));
