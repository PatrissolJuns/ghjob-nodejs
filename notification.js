// Enable .env setting
require('dotenv').config();
// Initialization of database
require("./mongodb").initMongoDb();

const gcm = require('node-gcm');
const logger = require('./config/logger');
const {getNewJobs, saveNewJobs} = require("./functions");

// GCM
const sender = new gcm.Sender(process.env.FCM_SERVER_KEY);

// Model
const Device = require('./models/Device'),
    Notification = require('./models/Notification');

/**
 * Get message to send for a given new jobs
 * @param newJobs
 * @returns {Message}
 */
const getMessage = (newJobs) => {
    const jobsTitle = newJobs.map(j => j.title).join(" | ");
    const title = `${newJobs.length} new job${newJobs.length > 1 ? 's' : ''}`;
    const message = `Hey, there${newJobs.length > 1 ? "'re" : "'s"} ${newJobs.length} new jobs. Click to view ${newJobs.length > 1 ? 'them' : 'it'}. ${jobsTitle}`;
    return new gcm.Message({
        // This parameter identifies a group of messages that can be collapsed,
        //   so that only the last message gets sent when delivery can be resumed.
        collapseKey: 'jobs',
        // Define priority
        priority: 'high',
        // On iOS, when a notification or message is sent and
        //   this is set to true, an inactive client app is awoken.
        contentAvailable: true,
        delayWhileIdle: true,
        // To send a test request first
        // dryRun: true,
        // Additional data
        data: {
            ids: JSON.stringify(newJobs.map(j => j.id)),
            type: 'NEW_JOBS',
            title,
            message,
        },
        // Notification object
        notification: {
            title: title,
            icon: "ic_launcher",
            body: message,
            color: "#ff513e"
        }
    });
};

logger.info("Starting performing...");
logger.info("Getting all new jobs...");
getNewJobs()
    .then(async jobs => {
        logger.info("All new jobs got");
        if (jobs.length > 0) {
            try {
                logger.info("Saving new jobs...");
                await saveNewJobs(jobs);
                logger.info("New jobs saved");
            } catch (e) {
                logger.error("Error while saving new jobs " + e);
                process.exit();
            }

            // Notify connected devices
            // Actually send the message
            Device.find({}, function (err, devices) {
                if (err) {
                    logger.error("Error while getting all devices " + err);
                    process.exit();
                }
                // Get devices to notify
                const tokens = devices.map(d => d.token);

                if (tokens.length === 0) {
                    logger.warn("Process stopped because there's no device into the database");
                    process.exit();
                }

                // Get message to send
                const message = getMessage(jobs);

                // Actually send message
                sender.send(message, { registrationTokens: tokens }, function (err, response) {
                    if (err) {
                        logger.error("Error while sending message to device " + err);
                        process.exit();
                    }
                    else {
                        // Save message into database
                        const notification = new Notification(message);
                        notification
                            .save()
                            .then(_notification => {
                                logger.info(`Found ${jobs.length} new job(s) with id: ${JSON.stringify(jobs.map(i => i.id))}`);
                                logger.info("Finished performing. Bye");
                                process.exit();
                            })
                            .catch(err => {
                                logger.error("Error while saving message to database " + err);
                                process.exit();
                            });
                    }
                });
            });
        } else {
            logger.info(`Found 0 new job`);
            logger.info("Finished performing. Bye");
            process.exit();
        }
    })
    .catch(response => {
        logger.error("Unable to get new jobs " + response);
        process.exit();
    });
