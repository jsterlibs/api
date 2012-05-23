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
    var user = parts[0];
    var repo = parts[1];

    github.repos.get({
        user: user,
        repo: repo
    }, function(err, d) {
        if(err) errCb(err);
        else ok(d);
    });

    function ok(d) {
        versions({
            name: d.name,
            url: d.html_url,
            homepage: d.homepage,
            description: d.description
            // TODO: licenses
        });
    }

    function versions(data) {
        // XXX: does not work ok with over 100 tags (pagination!)
        github.repos.getTags({
            user: user,
            repo: repo,
            per_page: 100
        }, function(err, d) {
            if(err) errCb(err);
            else {
                data.versions = d.map(function(o) {
                    return {
                        zip: o.zipball_url,
                        tar: o.tarball_url,
                        name: o.name
                        // TODO: size: ???
                    };
                });

                okCb(data);
            }
        });
    }
}

function id(a) {return a;}

