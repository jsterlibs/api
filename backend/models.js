var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var License = new Schema({
    name: {type: String, required: true},
    url: {type: String}
});

var Version = new Schema({
    url: {type: String},
    downloadUrl: {type: String},
    number: {type: String, required: true},
    license: {type: [License]},
    size: {type: String},

    // it's probably enough to track these on Library level instead of Version
    dependencies: {type: [Library]},
    dependants: [Library],

    published: {type: Date},

    created: {type: Date, 'default': Date.now},
    deleted: {type: Boolean, 'default': false}
});

var Library = new Schema({
    name: {type: String, required: true},
    url: {type: String, required: true},
    description: {type: String},
    followers: {type: [Number]},
    versions: {type: [Version]},

    // GitHub specific info
    // as this is going to be fetched dynamically via their API,
    // commented out for now
    //watchers: {type: Number},
    //forks: {type: Number},
    //downloads: {type: Number},

    created: {type: Date, 'default': Date.now},
    deleted: {type: Boolean, 'default': false}
});

// TODO: figure out how to deal with tag synonyms (separate model)
var Tag = new Schema({
    name: {type: String, required: true},
    children: {type: [Tag]},

    created: {type: Date, 'default': Date.now},
    deleted: {type: Boolean, 'default': false}
});

function get(model, id, okCb, errCb) {
    model.findById(id, function(err, data) {
        if(err) return errCb(err);

        okCb(data);
    });
}

function create(model, data, okCb, errCb) {
    var ob = new model(data);

    ob.save(function(err, d) {
        if(err) return errCb(err);

        okCb(d);
    });
}

function getAll(model, okCb, errCb) {
    model.find({}, function(err, data) {
        if(err) return errCb(err);

        okCb(data);
    });
}

function update(model, data, okCb, errCb) {
    // TODO
    //model.findById(data.id);
}

exports.License = mongoose.model('License', License);
exports.Library = mongoose.model('Library', Library);
exports.Tag = mongoose.model('Tag', Tag);

exports.get = get;
exports.create = create;
exports.getAll = getAll;
exports.update = update;
