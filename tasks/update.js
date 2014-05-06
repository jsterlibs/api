'use strict';

var async = require('async');
var request = require('request');
var sugar = require('mongoose-sugar');

var Library = require('../schemas').Library;


module.exports = function(cb) {
    var url = 'http://jster.net/api/list';

    console.log('Updating API');

    request.get(url, {
        json: true
    }, function(err, res, libraries) {
        if(err) {
            return console.error(err);
        }

        console.log('Fetched jster data');

        async.each(libraries, function(library, cb) {
            sugar.getOrCreate(Library, {
                name: library.name
            }, function(err, d) {
                if(err) {
                    return cb(err);
                }

                sugar.update(Library, d._id, {
                    description: library.description,
                    github: library.github,
                    homepage: library.homepage,
                    forks: library.forks,
                    watchers: library.watchers,
                    logo: library['logo_url'],
                    twitter: library['twitter_tag'],
                    tags: library.tags
                }, cb);
            });
        }, function(err) {
            if(err) {
                console.error(err);

                return cb(err);
            }

            console.log('Updated API data');

            cb();
        });
    });
};
