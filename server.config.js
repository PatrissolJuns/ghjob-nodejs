module.exports = {
    apps: [
        {
            name: 'ghjob-nodejs',
            script: './server.js',
            instances: "max",
            exec_mode: 'cluster',
            watch: false,
            env: {
                NODE_ENV: 'production',
                PORT: '8504'
            }
        }
    ]
};

