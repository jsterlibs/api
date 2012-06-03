#!/usr/bin/env node
var express = require('express');
var mongoose = require('mongoose');
var sugar = require('mongoose-sugar');
var rest = require('rest-sugar');
var models = require('./models');
var config = require('./config');

main();

function main() {
    mongoose.connect(config.MONGO_URL);

    var app = express.createServer();

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT
        app.use(express.bodyParser()); // handles POST
        app.use(app.router);
    });

    rest.init(app, '/api/v1/', {
        'libraries': models.Library,
        'tags': models.Tag,
        'licenses': models.License
    }, sugar, rest.auth.key('apikey', config.APIKEY, isHttps));

    app.listen(config.PORT);
}

function isHttps(req) {
    if(process.env.NODE_ENV == 'production')
        // http://stackoverflow.com/questions/8152651/how-can-i-check-that-a-request-is-coming-over-https-in-express
        return (req.headers['x-forwarded-proto'] &&
                req.headers['x-forwarded-proto'] === "https");

    return true;
}

