var fkit = require('funkit');
var mongoose = require('mongoose');
var mongooseTypes = require('mongoose-types');
var ObjectId = mongoose.Schema.ObjectId;

mongooseTypes.loadTypes(mongoose, "url");
var Url = mongoose.SchemaTypes.Url;

function isObjectId(n) {
    return mongoose.Schema.ObjectId.isValid(n);
}

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

function refs(name) {
    return [{type: ObjectId, ref: name, validate: isObjectId}];
}

function schema(name, o) {
    o.created = {type: Date, 'default': Date.now};
    var meta = initMeta(o);
    o.deleted = {type: Boolean, 'default': false, select: false};

    var ret = mongoose.model(name, new mongoose.Schema(o, {strict: true}));
    ret.meta = meta;
    return ret;
}

function initMeta(o) {
    var ret = {};

    for(var k in o) {
        ret[k] = copy(o[k]);

        var v = ret[k];
        var type = v.type;
        if(fkit.isArray(v)) {
            ret[k][0] = copy(v[0]);
            ret[k][0].type = v[0].type.name;
        }
        else if(fkit.isArray(type)) ret[k].type = [type[0].name];
        else ret[k].type = type.name;
    }

    return ret;
}

// TODO: move to funkit
function copy(o) {
    if(fkit.isObject(o)) {
        var ret = {};
        for(var k in o) ret[k] = o[k];
        return ret;
    }
    else if(fkit.isArray(o)) return o.slice(0);
}

function get(model, id, fields, okCb, errCb) {
    model.findById(id, fields, function(err, data) {
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

function getAll(model, query, okCb, errCb) {
    var fields = query.fields;
    var limit = query.limit;
    var skip = limit * query.offset;

    delete query.fields;
    delete query.limit;
    delete query.offset;

    model.find(query, fields, {limit: limit, skip: skip}).
        where('deleted', false).
        run(function(err, data) {
            if(err) errCb(err);
            else okCb(data);
        }
    );
}

function update(model, id, data, okCb, errCb) {
    get(model, id, undefined, function(ob) {
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

function count(model, okCb, errCb) {
    model.count({}, function(err, count) {
        if(err) errCb(err);
        else okCb(count);
    });
}

function getMeta(model) {
    return model.meta;
}

exports.get = get;
exports.create = create;
exports.getAll = getAll;
exports.update = update;
exports['delete'] = del;
exports.count = count;
exports.getMeta = getMeta;

