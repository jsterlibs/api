var mongoose = require('mongoose');
var mongooseTypes = require('mongoose-types');

mongooseTypes.loadTypes(mongoose, "url");
var Url = mongoose.SchemaTypes.Url;

var License = schema({
    name: {type: String, required: true},
    url: {type: Url}
});

var Version = schema({
    zip: {type: Url},
    tar: {type: Url},
    name: {type: String, required: true},
    size: {type: String},

    // it's probably enough to track these on Library level instead of Version
    dependencies: {type: [Library]},
    dependants: [Library],

    published: {type: Date}
});

var Library = schema({
    name: {type: String, required: true},
    repository: {type: Url, required: true},
    homepage: {type: Url},
    description: {type: String},
    followers: {type: [Number]},
    versions: {type: [Version]},
    licenses: {type: [License]},

    tags: {type: [Tag]}
});

// TODO: figure out how to deal with tag synonyms (separate model)
var Tag = schema({
    name: {type: String, required: true},
    children: {type: [Tag]}
});

function schema(o) {
    // metadata
    o.created = {type: Date, 'default': Date.now};
    o.deleted = {type: Boolean, 'default': false, select: false};

    return new mongoose.Schema(o, {strict: true});
}

function get(model, id, okCb, errCb) {
    model.findById(id, function(err, data) {
        if(err) return errCb(err);

        okCb(data);
    });
}

function create(model, data, okCb, errCb) {
    var ob = new model(data);

    ob.save(function(err, d) {
        if(err) errCb(err);
        else okCb(d);
    });
}

function getAll(model, okCb, errCb) {
    model.find({}).where('deleted', false).run(function(err, data) {
        if(err) errCb(err);
        else okCb(data);
    });
}

function update(model, id, data, okCb, errCb) {
    get(model, id, function(ob) {
        for(var k in data) {
            ob[k] = data[k];
        }

        return ob.save(function(err) {
            if(err) errCb(err);
            else okCb(ob);
        });
    }, errCb);
}

function del(model, id, okCb, errCb) {
    update(model, id, {deleted: true},
        function() {okCb({});},
        errCb);
}

exports.License = mongoose.model('License', License);
exports.Library = mongoose.model('Library', Library);
exports.Tag = mongoose.model('Tag', Tag);

exports.get = get;
exports.create = create;
exports.getAll = getAll;
exports.update = update;
exports.del = del;

