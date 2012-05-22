#!/usr/bin/env node
var express = require('express');
var mongoose = require('mongoose');
var models = require('./models');

var DB = 'localhost/jswiki';
var MSGS = {
    del: "Sorry, it's not possible to delete this resource"
};

main();

function main() {
    var app = express.createServer();

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
    initLibraries(app);
    initTags(app);
    initLicenses(app);
}

function initLibraries(app) {
    var prefix = '/apiv1/libraries';

    crud(app, prefix,
        function(req, res) {
            // TODO: auth
            models.create(models.Library, req.body,
                function(d) {res.json(d);},
                function(d) {res.json(d);}
            );
        },
        function(req, res) {
            models.getAll(models.Library,
                function(d) {res.json(d);},
                function(d) {res.json(d);}
            );
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

    crud(app, prefix + '/:id/followers',
        function(req, res) {
            res.json('create followers');
        },
        function(req, res) {
            res.json('get followers');
        },
        function(req, res) {
            res.json('update followers');
        },
        function(req, res) {
            res.json('delete followers');
        }
    );
}

function initTags(app) {
    var prefix = '/apiv1/tags';

    crud(app, prefix,
        function(req, res) {
            res.json('create tags');
        },
        function(req, res) {
            res.json(models.getAll(models.Tag));
        },
        function(req, res) {
            res.json('update tags');
        },
        function(req, res) {
            res.json('delete tags');
        }
    );

    crud(app, prefix + '/:id',
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

function initLicenses(app) {
    var prefix = '/apiv1/licenses';

    crud(app, prefix,
        function(req, res) {
            res.json('create licenses');
        },
        function(req, res) {
            res.json(models.getAll(models.License));
        },
        function(req, res) {
            res.json('update licenses');
        },
        function(req, res) {
            res.json('delete licenses');
        }
    );

    crud(app, prefix + '/:id',
        function(req, res) {
            res.json('create license');
        },
        function(req, res) {
            res.json('get license');
        },
        function(req, res) {
            res.json('update license');
        },
        function(req, res) {
            res.json('delete license');
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

