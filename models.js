var mongoose = require('mongoose');
var sugar = require('mongoose-sugar');
var mongooseTypes = require('mongoose-types');

mongooseTypes.loadTypes(mongoose, "url");
var Url = mongoose.SchemaTypes.Url;

var schema = sugar.schema(mongoose);
var refs = sugar.refs;

exports.License = schema('License', {
    name: {type: String, required: true},
    url: {type: Url}
});

exports.Version = schema('Version', {
    zip: {type: Url},
    tar: {type: Url},
    name: {type: String, required: true},
    size: {type: String},

    // it's probably enough to track these on Library level instead of Version
    dependencies: refs('Library'),
    dependants: refs('Library'),

    published: {type: Date}
});

exports.Library = schema('Library', {
    name: {type: String, required: true},
    repository: {type: Url, required: true, validate: [
        repositoryValidator, 'repository exists already']},
    homepage: {type: Url},
    description: {type: String},
    followers: {type: [Number]},
    versions: refs('Version'),
    licenses: refs('License'),
    tags: refs('Tag')
});

function repositoryValidator(v, fn) {
    getAll(exports.Library, {repository: v},
        function(d) {fn(!d.length);},
        function() {fn(false);}
    );
}

// TODO: figure out how to deal with tag synonyms (separate model)
exports.Tag = schema('Tag', {
    name: {type: String, required: true},
    children: refs('Tag')
});

