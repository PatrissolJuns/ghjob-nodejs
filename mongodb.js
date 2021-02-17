const mongoose = require('mongoose');
const logger = require('./config/logger');

/**
 * Script to connect to mongo DB
 */
const initMongoDb = () => {
    mongoose
        .connect(
            process.env.MONGO_DB_URL || 'mongodb://localhost:27017/ghjob',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        )
        .then(() => {
            logger.info('Connected to mongoDB');
        })
        .catch(error => {
            logger.error('Error while DB connecting ' + error);
            process.exit("Unable to connect to database");
        });
};

module.exports = {
    initMongoDb
};
