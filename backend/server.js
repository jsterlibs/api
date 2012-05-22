#!/usr/bin/env node
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
        }
    );

    crud(app, prefix + '/:id',
        undefined,
        function(req, res) {
            models.get(models.Library, req.params.id,
                function(d) {res.json(d);},
                function(d) {error(res, MSGS.notFound, 404);}
            );
        },
        function(req, res) {
            models.update(models.Library, req.params.id, req.body,
                function(d) {res.json(d);},
                function(d) {error(res, MSGS.notFound, 404);}
            );
        },
        function(req, res) {
            // TODO: auth, error(res, MSGS.del, 400)
            models.del(models.Library, req.params.id,
                function(d) {res.json(d);},
                function(d) {error(res, MSGS.notFound, 404);}
            );
        }
    );
}

function initTags(app) {
    var prefix = '/apiv1/tags';

    crud(app, prefix,
        function(req, res) {
            // TODO: auth
            models.create(models.Tag, req.body,
                function(d) {res.json(d);},
                function(d) {res.json(d);}
            );
        },
        function(req, res) {
            models.getAll(models.Tag,
                function(d) {res.json(d);},
                function(d) {res.json(d);}
            );
        }
    );

    crud(app, prefix + '/:id',
        undefined,
        function(req, res) {
            models.get(models.Tag, req.params.id,
                function(d) {res.json(d);},
                function(d) {error(res, MSGS.notFound, 404);}
            );
        },
        function(req, res) {
            models.update(models.Tag, req.params.id, req.body,
                function(d) {res.json(d);},
                function(d) {error(res, MSGS.notFound, 404);}
            );
        },
        function(req, res) {
            // TODO: auth, error(res, MSGS.del, 400)
            models.del(models.Tag, req.params.id,
                function(d) {res.json(d);},
                function(d) {error(res, MSGS.notFound, 404);}
            );
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

