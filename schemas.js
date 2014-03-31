var mongoose = require('mongoose');
var sugar = require('mongoose-sugar');

var schema = sugar.schema(mongoose);


schema(exports, 'Library').fields({
    name: {type: String, required: true},
    description: String,
    github: String,
    homepage: String,
    forks: Number,
    watchers: Number,
    logo: String,
    twitter: String
});

