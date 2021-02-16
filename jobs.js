// Enable .env setting
require('dotenv').config();

// Load database
const { jobsDB } = require('./databases');
const logger = require('./config/logger');

const PAGINATE_NUMBER = Number(process.env.PAGINATE_NUMBER) || 20;

/**
 * Get all jobs
 * @param req
 * @param res
 */
const getAllJobs = (req, res) => {
    const page = ~~Number(req.query.page) || 1;
    jobsDB
        .find({}, { description: 0, how_to_apply: 0 })
        .sort({createdAt: -1})
        .skip(page > 1 ? ((page - 1) * PAGINATE_NUMBER) : 0)
        .limit(PAGINATE_NUMBER)
        .exec(function (err, docs) {
            if (err) {
                logger.error("Error while getting all jobs: " + err);
                return res.status(400).send({
                    status: false,
                    error: err,
                    code: "internal-server-error",
                    message: "Error while getting all jobs"
                });
            }
            res.json(docs);
        });
};

/**
 * Get one job by id
 * @param req
 * @param res
 */
const getOneJob = (req, res) => {
    const { id } = req.params;
    jobsDB
        .findOne({id})
        .exec(function (err, docs) {
            if (err) {
                logger.error("Error while getting one job: " + err);
                return res.status(400).send({
                    status: false,
                    code: "internal-server-error",
                    message: "Error while getting one job"
                });
            }
            if (docs) {
                res.json(docs);
            } else {
                return res.status(400).send({
                    status: false,
                    code: "jobs/one/not-found",
                    message: "Job does not exists"
                });
            }
        });
};

/**
 * Search jobs
 * search params:
 *  - search String match within title, description, company and how to apply
 *  - location Job's location
 *  - fullTime Match full time's jobs
 * @param req
 * @param res
 */
const searchJobs = (req, res) => {
    const page = ~~Number(req.query.page) || 1;
    const { search, fullTime, location } = req.query;
    let query = {};

    // Full time filtering
    if (fullTime && fullTime === 'true')
        query.type = new RegExp('Full Time', 'i');

    // Location filtering
    if (location) {
        const _location = location.replace('+', '');
        query.location = new RegExp(_location, 'i');
    }

    jobsDB
        .find(query)
        .sort({createdAt: -1})
        .exec(function (err, jobs) {
            if (err) {
                logger.error("Error while searching jobs: " + err);
                return res.status(400).send({
                    status: false,
                    error: err,
                    code: "internal-server-error",
                    message: "Error while searching jobs"
                });
            }
            // Perform filtering
            let results = jobs;

            // Perform search filtering
            if (search) {
                const regex = new RegExp(search, 'i');
                results = jobs
                    .filter(job => {
                        let belong = false;
                        if (
                            regex.test(job.title)
                            || regex.test(job.description)
                            || regex.test(job.company)
                            || regex.test(job.how_to_apply)
                        ) {
                            belong = true;
                        }

                        return belong;
                    });
            }

            // Pagination
            const start = page > 1 ? ((page - 1) * PAGINATE_NUMBER) : 0;
            results = results.slice(start, start + PAGINATE_NUMBER);

            // Delete unwanted key
            results = results.map(job => {
                delete job.description;
                delete job.how_to_apply;
                return job;
            });

            res.json(results);
        });
};

module.exports = {
    getOneJob,
    getAllJobs,
    searchJobs,
};
