#!/usr/bin/env node
/*
 * Remember to run mongod and the server before running this!
 *
 * */
var client = require('rest-sugar-client');

var URL = 'http://localhost:8000/api/v1';
var APIKEY = 'dummy';

main();

// XXX: should delete demoTag before creating it!
function main() {
    client.api(URL + '?apikey=' + APIKEY, function(err, api) {
        if(err) return console.log(err);

        createTag(api, function(err) {
            if(err) return console.log(err);

            api.libraries.get({name: 'test'}, function(err, d) {
                if(err) return console.log(err);

                if(d.length) deleteLibrary(api, d[0]._id, createLibrary);
                else createLibrary(api);
            });
        });
    });
}

function createTag(api, cb) {
    api.tags.create({name: 'demoTag21'}, cb);
}

function deleteLibrary(api, id, cb) {
    api.libraries['delete']({id: id}, function(err, d) {
        if(err) console.log(err);
        else cb(api);
    });
}

function createLibrary(api) {
    api.libraries.create({
        name: 'test',
        repository: 'http://www.demo.com',
        tags: 'demoTag21'
    }, function(err, d) {
        if(err) return console.log(err);

        console.log(d);
    });
}

