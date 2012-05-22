#!/usr/bin/env node
var express = require('express');
var mongoose = require('mongoose');

var DB = 'localhost/jswiki';
var MSGS = {
    del: "Sorry, it's not possible to delete this resource"
};

main();

function main() {
    var app = express.createServer();

    mongoose.connect('mongodb://' + DB);

    initREST(app);

    app.listen(8000);
}

function initREST(app) {
    initLibraries(app);
    initTags(app);
}

function initLibraries(app) {
    var prefix = '/apiv1/libraries';

    crud(app, prefix,
        function(req, res) {
            res.json('create libraries');
        },
        function(req, res) {
            res.json('get libraries');
        },
        function(req, res) {
            res.json('update libraries');
        },
        function(req, res) {
            // trigger only if the api key doesn't provide rights
            error(res, MSGS.del, 400);
            // else set delete flag
        }
    );

    crud(app, prefix + '/:id',
        function(req, res) {
            res.json('create library');
        },
        function(req, res) {
            res.json('get library');
        },
        function(req, res) {
            res.json('update library');
        },
        function(req, res) {
            res.json('delete library');
        }
    );

    crud(app, prefix + '/:id/tags',
        function(req, res) {
            res.json('create tags');
        },
        function(req, res) {
            res.json('get tags');
        },
        function(req, res) {
            res.json('update tags');
        },
        function(req, res) {
            res.json('delete tags');
        }
    );
}

function initTags(app) {
    crud(app, '/apiv1/tags',
        function(req, res) {
            res.json('create tags');
        },
        function(req, res) {
            res.json('get tags');
        },
        function(req, res) {
            res.json('update tags');
        },
        function(req, res) {
            res.json('delete tags');
        }
    );

    crud(app, '/apiv1/tags/:id',
        function(req, res) {
            res.json('create tag');
        },
        function(req, res) {
            res.json('get tag');
        },
        function(req, res) {
            res.json('update tag');
        },
        function(req, res) {
            res.json('delete tag');
        }
    );
}

function crud(app, url, post, get, put, del) {
    app.post(url, post);
    app.get(url, get);
    app.put(url, put);
    app.del(url, del);
}

function error(res, msg, code) {
    res.json({errors: [{message: msg}]}, code);
}

