var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var License = new Schema({
    name: {type: String, required: true},
    url: {type: String},

    // model metadata
    created: {type: Date, 'default': Date.now},
    deleted: {type: Boolean, 'default': false}
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

    // model metadata
    created: {type: Date, 'default': Date.now},
    deleted: {type: Boolean, 'default': false}
});

var Library = new Schema({
    name: {type: String, required: true},
    url: {type: String, required: true},
    homepage: {type: String},
    description: {type: String},
    followers: {type: [Number]},
    versions: {type: [Version]},
    tags: {type: [Tag]},

    // GitHub specific info
    // as this is going to be fetched dynamically via their API,
    // commented out for now
    //watchers: {type: Number},
    //forks: {type: Number},
    //downloads: {type: Number},

    // model metadata
    created: {type: Date, 'default': Date.now},
    deleted: {type: Boolean, 'default': false}
});

// TODO: figure out how to deal with tag synonyms (separate model)
var Tag = new Schema({
    name: {type: String, required: true},
    children: {type: [Tag]},

    // model metadata
    created: {type: Date, 'default': Date.now},
    deleted: {type: Boolean, 'default': false}
});

function get(model, id, okCb, errCb) {
    model.findById(id, function(err, data) {
        if(err || data.deleted) return errCb(err);

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

