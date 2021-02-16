require('dotenv').config();
const gcm = require('node-gcm');
const logger = require('./config/logger');
const {getNewJobs, saveNewJobs} = require("./functions");

// The database
const { jobsDB, devicesDB, notificationsDB } = require('./databases');
// GCM
const sender = new gcm.Sender(process.env.FCM_SERVER_KEY);

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
        /*notification: {
            title: `${newJobs.length} new job${newJobs.length > 1 ? 's' : ''}`,
            icon: "ic_launcher",
            body: message
        }*/
    });
};

logger.info("Starting performing... at " + Date());
getNewJobs(jobsDB)
    .then(async jobs => {
        if (jobs.length > 0) {
            await saveNewJobs(jobsDB, jobs);

            // Notify connected devices
            // Actually send the message
            devicesDB.find({}, function (err, docs) {
                if (!err) {
                    // Get devices to notify
                    const devices = docs.map(d => d.token);
                    // Get message to send
                    const message = getMessage(jobs);

                    // Actually send message
                    sender.send(message, { registrationTokens: devices }, function (err, response) {
                        if (err) logger.error("Error while sending message to device " + err);
                        else {
                            // Save message into database
                            notificationsDB.insert({...message, createdAt: Date.now()}, function (err, docs) {
                                if (err) logger.error("Error while saving message to database " + err);
                                else {
                                    logger.info(`Found ${jobs.length} new job(s) with id: ${JSON.stringify(jobs.map(i => i.id))}`);
                                    logger.info("Finished performing!!! at " + Date());
                                }
                            });
                        }
                    });
                }
            });
        } else {
            logger.info(`Found 0 new job`);
            logger.info("Finished performing!!! at " + Date());
        }
    })
    .catch(response => logger.error("Unable to get new jobs " + response));
