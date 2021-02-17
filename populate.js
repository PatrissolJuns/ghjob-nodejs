/**
 * Script to fill in the database
 */

// Initialization of database
require("./mongodb").initMongoDb();
const logger = require('./config/logger');
const {populate} = require("./functions");

logger.info("Started population...");
populate()
    .then((data) => {
        logger.info(`Added ${data.length} jobs`);
    })
    .catch((error) => {
        logger.error("An error occurred while populating database " + error);
    })
    .finally(() => {
        logger.info("Population finished. Bye");
        process.exit();
    });
