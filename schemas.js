var sugar = require('object-sugar');

var schema = sugar.schema();
var refs = sugar.refs;


schema(exports, 'License').fields({
    name: {type: String, required: true},
    description: {type: String, required: true}
});

schema(exports, 'Library').fields({
    name: {type: String, required: true},
    tagline: {type: String, required: true},
    description: {type: String, required: true},
    officialSite: String,
    github: String,
    tags: [String],
    license: refs('License'),
    stars: Number
});

