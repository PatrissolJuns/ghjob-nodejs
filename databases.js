const Datastore = require('nedb');
// The database
const jobsDB = new Datastore({ filename: './jobs.db', autoload: true});
const devicesDB = new Datastore({ filename: './devices.db', autoload: true});
const notificationsDB = new Datastore({ filename: './notifications.db', autoload: true});

module.exports = {
    jobsDB,
    devicesDB,
    notificationsDB,
};
