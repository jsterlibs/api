#!/usr/bin/env node
var GitHubApi = require('github');
var github = new GitHubApi({version: '3.0.0'});

main();

function main() {
    fetchInfo('https://github.com/bebraw/colorjs',
        function(d) {console.log(d);},
        function(d) {console.log(d);}
    );
}

function fetchInfo(url, errCb, okCb) {
    var parts = url.split('/').filter(id).slice(-2);
    github.repos.get({
        user: parts[0],
        repo: parts[1]
    }, function(err, d) {
        if(err) errCb(err);
        else ok(d);
    });

    function ok(d) {
        okCb({
            name: d.name,
            url: d.html_url,
            homepage: d.homepage,
            description: d.description,
            versions: versions(d)
        });
    }

    function versions(d) {
        // TODO
        return [];
    }
}

function id(a) {return a;}

