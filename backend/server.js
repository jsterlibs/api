#!/usr/bin/env node
var fs = require('fs');
var express = require('express');
var mongoose = require('mongoose');
var models = require('./models');

var DB = 'localhost/jswiki';
var MSGS = {
    del: "Sorry, it's not possible to delete this resource",
    notFound: "Sorry, unable to find this resource"
};

main();

function main() {
    var app = express.createServer({
        key: fs.readFileSync('certs/key.pem'),
        cert: fs.readFileSync('certs/cert.pem')
    });

    mongoose.connect('mongodb://' + DB);

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT
        app.use(express.bodyParser()); // handles POST
        app.use(app.router);
    });

    initREST(app);

    app.listen(8000);
}

function initREST(app) {
    var apis = {
        'libraries': models.Library,
        'tags': models.Tag,
        'licenses': models.License
    };

    for(var k in apis) initCrud(app, '/apiv1/' + k, apis[k]);
}

function initCrud(app, prefix, model) {
    function ret(res) {
        return function(d) {res.json(d);};
    }

    crud(app, prefix,
        function(req, res) {
            // TODO: auth
            models.create(model, req.body, ret(res), ret(res));
        },
        function(req, res) {
            models.getAll(model, ret(res), ret(res));
        }
    );

    crud(app, prefix + '/:id',
        undefined,
        function(req, res) {
            models.get(model, req.params.id, ret(res),
                function(d) {error(res, MSGS.notFound, 404);}
            );
        },
        function(req, res) {
            models.update(model, req.params.id, req.body, ret(res),
                function(d) {error(res, MSGS.notFound, 404);}
            );
        },
        function(req, res) {
            // TODO: auth, error(res, MSGS.del, 400)
            models.update(model, req.params.id, {deleted: true},
                function(d) {res.json({});},
                function(d) {error(res, MSGS.notFound, 404);}
            );
        }
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

