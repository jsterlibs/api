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

    initAPI(app);

    app.listen(config.PORT);
}

function initAPI(app) {
    rest.init(app, '/api/v1/', {
        'libraries': models.Library,
        'tags': models.Tag,
        'licenses': models.License
    }, sugar, auth);
}

function auth(fn) {
    var unauthorized = "Sorry, unable to access this resource. Check your auth";

    return function(req, res) {
        if(process.env.NODE_ENV == 'production') {
            // http://stackoverflow.com/questions/8152651/how-can-i-check-that-a-request-is-coming-over-https-in-express
            if(req.headers['x-forwarded-proto'] &&
                    req.headers['x-forwarded-proto'] === "http") {
                error(res, unauthorized);
                return;
            }
        }

        if(req.query.apikey === config.APIKEY || req.body.apikey === config.APIKEY) {
            delete req.query.apikey;
            fn(req, res);
        }
        else error(res, unauthorized);
    };
}

function error(res, msg, code) {
    res.json({errors: [{message: msg}]}, code);
}

