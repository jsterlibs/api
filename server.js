#!/usr/bin/env node
var express = require('express');
var mongoose = require('mongoose');
var sugar = require('mongoose-sugar');
var models = require('./models');
var config = require('./config');

var MSGS = {
    unauthorized: "Sorry, unable to access this resource. Check your auth",
    notFound: "Sorry, unable to find this resource"
};

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
    initREST(app, '/api/v1/', {
        'libraries': models.Library,
        'tags': models.Tag,
        'licenses': models.License
    }, sugar, MSGS, auth);
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

        if(req.query.apikey === config.APIKEY || req.body.apikey === config.APIKEY) {
            delete req.query.apikey;
            fn(req, res);
        }
        else error(res, MSGS.unauthorized);
    };
}

function initREST(app, prefix, apis, models, msgs, auth) {
    app.get(prefix, function(req, res) {
        var api = {};

        for(var k in apis) api[k] = models.getMeta(apis[k]);

        res.json(api);
    });

    for(var k in apis) init(prefix + k, apis[k]);

    function init(name, model) {
        crud(app, name, handlers({
            post: function(req, res) {
                models.create(model, req.body, ret(res), ret(res));
            },
            get: function(req, res) {
                var method = req.query.method;

                if(method) getOp(this, method)(req, res);
                else models.getAll(model, req.query, ret(res), ret(res));
            }
        }));

        app.get(name + '/count', handle(function(req, res) {
            models.count(model, ret(res), err(res));
        }));

        crud(app, name + '/:id', handlers({
            get: function(req, res) {
                var method = req.query.method;

                if(method) getOp(this, method)(req, res);
                else models.get(model, req.params.id, req.query.fields, ret(res), err(res));
            },
            put: function(req, res) {
                models.update(model, req.params.id, req.body, ret(res), err(res));
            },
            'delete': function(req, res) {
                models.del(model, req.params.id, ret(res), err(res));
            }
        }));
    }

    function handlers(o) {
        for(var k in o) o[k] = handle(o[k]);

        return o;
    }

    function handle(fn) {
        return auth(function(req, res) {
            req.body = parseCommaLists(req.body);
            req.query = parseCommaLists(req.query);
            fn(req, res);
        });
    }

    function ret(res) {
        return function(d) {res.json(d);};
    }

    function err(res) {
        return function(e) {
            if(e) res.json(e);
            else error(res, msgs.notFound, 404);
        };
    }

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

