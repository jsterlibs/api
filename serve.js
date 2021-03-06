#!/usr/bin/env node
'use strict';

var express = require('express');
var rest = require('rest-sugar');
var sugar = require('mongoose-sugar');
var taskist = require('taskist');

var config = require('./config');
var schemas = require('./schemas');
var tasks = require('./tasks');


main();

function main() {
    var mongoUrl = sugar.parseAddress(config.mongo);

    console.log('Connecting to database');

    sugar.connect(mongoUrl, function(err) {
        if(err) {
            return console.error('Failed to connect to database', mongoUrl, err);
        }

        console.log('Connected to database');
        console.log('Starting server');

        process.on('exit', terminator);

        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
        'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element) {
            process.on(element, function() { terminator(element); });
        });

        serve();
    });
}

function serve() {
    var app = express();
    var port = config.port;

    app.configure(function() {
        app.set('port', port);

        app.use(express.logger('dev'));

        app.use(app.router);
    });

    app.configure('development', function() {
        app.use(express.errorHandler());
    });

    var api = rest(app, '/v1', {
        libraries: schemas.Library
    }, sugar);

    api.pre(function() {
        api.use(rest.only('GET'));
    });

    taskist(config.tasks, tasks, {instant: true});

    app.listen(port, function() {
        console.log('%s: Node (version: %s) %s started on %d ...', Date(Date.now() ), process.version, process.argv[1], port);
    });
}

function terminator(sig) {
    if(typeof sig === 'string') {
        console.log('%s: Received %s - terminating Node server ...',
            Date(Date.now()), sig);

        process.exit(1);
    }

    console.log('%s: Node server stopped.', Date(Date.now()) );
}
