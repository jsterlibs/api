var env = process.env;

exports.APIKEY = env.APIKEY || 'dummy';
exports.READONLY_APIKEY = env.READONLYAPIKEY || 'dummy2';
exports.MONGO_URL = env.NODE_ENV == 'production'?
    env.MONGOHQ_URL: 'mongodb://localhost/jswiki';
exports.PORT = env.PORT || 8000;

