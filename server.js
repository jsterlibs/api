#!/usr/bin/env node
var express = require('express');
var mongoose = require('mongoose');
var sugar = require('mongoose-sugar');
var rest = require('rest-sugar');
var funkit = require('funkit');
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

    var prefix = '/api/v1/';
    var auth = rest.auth.key('apikey', config.APIKEY, isHttps);

    // TODO: tidy up using multiple inits (rest-sugar needs tweaking)
    var oldCreate = sugar.create;
    sugar.create = function(model, data, cb) {
        if(model.modelName == 'Library') {
            funkit.parallel(function(name, done) {
                sugar.getAll(models.Tag, {name: name}, done);
            }, data.tags, function(err, d) {
                if(err) return cb(err);

                data.tags = getIds(d);

                oldCreate(model, data, cb);
            });
        }
        else oldCreate(model, data, cb);
    };

    rest.init(app, prefix, {
        'tags': models.Tag,
        'licenses': models.License,
        'libraries': models.Library
    }, sugar, auth);

    app.listen(config.PORT);
}

function getIds(d) {
    if(!d.length) return [];

    var ret = [];

    funkit.concat(d.filter(function(k) {
            return k.length > 0;
        })).forEach(function(k) {
            ret.push(k._id);
        }
    );

    return ret;
}

function isHttps(req) {
    if(process.env.NODE_ENV == 'production')
        // http://stackoverflow.com/questions/8152651/how-can-i-check-that-a-request-is-coming-over-https-in-express
        return (req.headers['x-forwarded-proto'] &&
                req.headers['x-forwarded-proto'] === "https");

    return true;
}

