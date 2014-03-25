var sugar = require('object-sugar');

var schema = sugar.schema();


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

