#!/usr/bin/env node
/*
 * Remember to run mongod and the server before running this!
 *
 * */
var client = require('rest-sugar-client');

var URL = 'http://localhost:8000/api/v1';
var APIKEY = 'dummy';

main();

function main() {
    client.api(URL + '?apikey=' + APIKEY, function(err, api) {
        if(err) return console.log(err);

        api.libraries.count(function(err, d) {
            if(err) return console.log(err);

            console.log(d);
        });
    });
}

