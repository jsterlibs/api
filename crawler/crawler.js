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

                license(data);
            }
        });
    }

    function license(data) {
        okCb(data);

        // it might be easier just to query urls directly
        // example: raw.github.com/:user/:repo/master/LICENSE
        // if that exists, link there!
        // if no master branch exists, check out gh-pages (special case)

        // TODO: might want to try to dig the licensing info from README too

        // XXX: possible pagination problem here too
        /*
        github.repos.getBranches({
            user: user,
            repo: repo,
            per_page: 100
        }, function(err, d) {
            if(err) errCb(err);
            var sha = (d.filter(function(o) {
                return o.name == 'master';
            }) || d)[0].commit.sha;

            github.gitdata.getTree({
                user: user,
                repo: repo,
                sha: sha
            }, function(err, d) {
                if(err) errCb(err);
                console.log(d);

                // XXX: got access to blobs now
                // dig needed info here somehow
                okCb(data);
            });
        });
        */
    }
}

function id(a) {return a;}

