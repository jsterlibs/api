module.exports = {
    port: 8000,
    mongo: {
        hostname: 'localhost',
        port: 27017,
        db: 'jster_api',
        username: '',
        password: ''
    },
    tasks: {
        update: {minute: 1}
    }
};
