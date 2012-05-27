#!/usr/bin/env node
var fs = require('fs');
var express = require('express');
var mongoose = require('mongoose');
var models = require('./models');
var config = require('./config');

var APIKEY = config.APIKEY;
var MSGS = {
    unauthorized: "Sorry, unable to access this resource. Check your auth",
    notFound: "Sorry, unable to find this resource"
};

main();

function main() {
    var app;
    var dbUrl;

    if(process.env.NODE_ENV == 'production') {
        app = express.createServer();

        dbUrl = process.env.MONGOHQ_URL;
    }
    else {
        app = express.createServer({
            key: fs.readFileSync(__dirname + '/certs/key.pem'),
            cert: fs.readFileSync(__dirname + '/certs/cert.pem')
        });

        dbUrl = 'mongodb://localhost/jswiki';
    }

    mongoose.connect(dbUrl);

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT
        app.use(express.bodyParser()); // handles POST
        app.use(app.router);
    });

    initREST(app);

    var port = process.env.PORT || 8000;
    app.listen(port);
}

function initREST(app) {
    var apis = {
        'libraries': models.Library,
        'tags': models.Tag,
        'licenses': models.License
    };

    for(var k in apis) initCrud(app, '/api/v1/' + k, apis[k]);
}

function initCrud(app, prefix, model) {
    function ret(res) {
        return function(d) {res.json(d);};
    }

    function auth(fn) {
        return function(req, res) {
            if(process.env.NODE_ENV == 'production') {
                // http://stackoverflow.com/questions/8152651/how-can-i-check-that-a-request-is-coming-over-https-in-express
                if(req.headers['x-forwarded-proto'] &&
                        req.headers['x-forwarded-proto'] === "http") {
                    error(res, MSGS.unauthorized);
                    return;
                }
            }

            if(req.query.apikey === APIKEY || req.body.apikey === APIKEY) {
                delete req.query.apikey;
                req.body = parseCommaLists(req.body);
                req.query = parseCommaLists(req.query);
                fn(req, res);
            }
            else error(res, MSGS.unauthorized);
        };
    }

    function err(res) {
        return function(e) {
            if(e) res.json(e);
            else error(res, MSGS.notFound, 404);
        };
    }

    crud(app, prefix, {
        post: auth(function(req, res) {
            models.create(model, req.body, ret(res), ret(res));
        }),
        get: auth(function(req, res) {
            var method = req.query.method;

            if(method) getOp(this, method)(req, res);
            else models.getAll(model, req.query, ret(res), ret(res));
        })
    });

    app.get(prefix + '/count', function(req, res) {
        models.count(model, ret(res), err(res));
    });

    crud(app, prefix + '/:id', {
        get: auth(function(req, res) {
            var method = req.query.method;

            if(method) getOp(this, method)(req, res);
            else models.get(model, req.params.id, req.query.fields, ret(res), err(res));
        }),
        put: auth(function(req, res) {
            models.update(model, req.params.id, req.body, ret(res), err(res));
        }),
        'delete': auth(function(req, res) {
            models.del(model, req.params.id, ret(res), err(res));
        })
    });

    function getOp(verbs, method) {
        if(method in verbs) return verbs;
        return notAllowed(verbs);
    }
}

function parseCommaLists(o) {
    var ret = {};

    for(var k in o) {
        var v = o[k];
        var parts = v.split(',');

        ret[k] = parts.length > 1? parts: v;
    }

    return ret;
}

function crud(app, url, verbs) {
    for(var k in verbs) app[k](url, verbs[k] || notAllowed(verbs));
}

function notAllowed(verbs) {
    var allowed = Object.keys(verbs).map(function(k) {k.toUpperCase();}).join(', ');

    return function(req, res){
        res.header('Allow', allowed);
        res.send(403);
    };
}

function error(res, msg, code) {
    res.json({errors: [{message: msg}]}, code);
}

