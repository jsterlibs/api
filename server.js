#!/usr/bin/env node
var express = require('express');
var mongoose = require('mongoose');

var DB = 'localhost/jswiki';

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
    crud(app, '/apiv1/libraries',
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
            res.json('delete libraries');
        }
    );

    crud(app, '/apiv1/libraries/:id',
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

