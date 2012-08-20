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

            getLibrary(api, {name: 'test'}, function(err, d) {
                if(err) return console.log(err);

                if(d.length) deleteLibrary(api, d[0]._id, test);
                else test(api);
            });
        });
    });
}

function test(api) {
    createLibrary(api, updateLibrary);
}

function createTag(api, cb) {
    api.tags.create({name: 'demoTag21'}, cb);
}

function getLibrary(api, o, cb) {
    api.libraries.get(o, function(err, d) {
        if(err) return console.log(err);

        cb(err, d);
    });
}

function deleteLibrary(api, id, cb) {
    api.libraries['delete']({id: id}, function(err, d) {
        if(err) console.log(err);
        else cb(api);
    });
}

function createLibrary(api, cb) {
    // since the tag does not exist, does not set it to anything
    // probably ok behavior for now
    api.libraries.create({
        name: 'test',
        repository: 'http://www.demo.com',
        tags: 'demoTag25'
    }, function(err, d) {
        if(err) return console.log(err);

        console.log('created library', d);

        cb(api, d);
    });
}

function updateLibrary(api, d) {
    d.name = 'updated test';

    api.libraries.update(d, function(err, d) {
        if(err) return console.log(err);

        console.log('updated library', d);
    });
}
