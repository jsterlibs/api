#!/usr/bin/env node
var fs = require('fs');
var express = require('express');
var mongoose = require('mongoose');
var models = require('./models');
var config = require('./config');

var APIKEY = config.APIKEY;
var DB = 'localhost/jswiki';
var MSGS = {
    unauthorized: "Sorry, unable to access this resource. Check your auth",
    notFound: "Sorry, unable to find this resource"
};

main();

function main() {
    var app;

    if(process.env.NODE_ENV == 'production' && false) {
        app = express.createServer();
    }
    else {
        app = express.createServer({
            key: fs.readFileSync('certs/key.pem'),
            cert: fs.readFileSync('certs/cert.pem')
        });
    }

    mongoose.connect('mongodb://' + DB);

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
            if(req.query.apikey === APIKEY || req.body.apikey === APIKEY) fn(req, res);
            else error(res, MSGS.unauthorized);
        };
    }

    crud(app, prefix,
        auth(function(req, res) {
            models.create(model, req.body, ret(res), ret(res));
        }),
        auth(function(req, res) {
            models.getAll(model, ret(res), ret(res));
        })
    );

    crud(app, prefix + '/:id',
        undefined,
        auth(function(req, res) {
            models.get(model, req.params.id, ret(res),
                function(d) {error(res, MSGS.notFound, 404);}
            );
        }),
        auth(function(req, res) {
            models.update(model, req.params.id, req.body, ret(res),
                function(d) {error(res, MSGS.notFound, 404);}
            );
        }),
        auth(function(req, res) {
            models.del(model, req.params.id, ret(res),
                function(d) {error(res, MSGS.notFound, 404);}
            );
        })
    );
}

function crud(app, url, post, get, put, del) {
    var allowed = getAllowed();

    function getAllowed() {
        var ret = [];

        if(post) ret.push('POST');
        if(get) ret.push('GET');
        if(put) ret.push('PUT');
        if(del) ret.push('DELETE');

        return ret.join(', ');
    }

    function notAllowed(req, res) {
        res.header('Allow', allowed);
        res.send(403);
    }

    app.post(url, post || notAllowed);
    app.get(url, get || notAllowed);
    app.put(url, put || notAllowed);
    app.del(url, del || notAllowed);
}

function error(res, msg, code) {
    res.json({errors: [{message: msg}]}, code);
}

