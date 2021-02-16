const { jobsDB } = require('./databases');
const logger = require('./config/logger');
const { populate } = require('./functions');

// Populate the job database
logger.info("Population has started");
populate(jobsDB)
    .then(() => logger.info("Population has finished"))
    .catch(error => logger.info("Error while populating " + error))
    .finally(() => process.exit());

