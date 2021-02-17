// Enable .env setting
require('dotenv').config();

// Load database
const Job = require('./models/Job');
const logger = require('./config/logger');

const PAGINATE_NUMBER = Number(process.env.PAGINATE_NUMBER) || 20;

/**
 * Get all jobs
 * @param req
 * @param res
 */
const getAllJobs = (req, res) => {
    const page = ~~Number(req.query.page) || 1;
    Job.paginate({}, {
            sort: {createdAt: -1},
            projection: "-description -how_to_apply",
            limit: PAGINATE_NUMBER,
            page: page,
        })
        .then(results => res.json(results))
        .catch(error => {
            logger.error("Error while getting all jobs: " + error);
            return res.status(400).send({
                status: false,
                code: "internal-server-error",
                message: "Error while getting all jobs"
            })
        });
};

/**
 * Get one job by id
 * @param req
 * @param res
 */
const getOneJob = (req, res) => {
    const { id } = req.params;
    Job.findOne({id})
        .then( job => {
            if (job) {
                res.json(job);
            } else {
                return res.status(400).send({
                    status: false,
                    code: "jobs/one/not-found",
                    message: "Job does not exists"
                });
            }
        })
        .catch(error => {
            logger.error("Error while getting one job: " + error);
            return res.status(400).send({
                status: false,
                code: "internal-server-error",
                message: "Error while getting one job"
            });
        });
};

/**
 * Search jobs
 * search params:
 *  - search String match within title, description, company and how to apply
 *  - location Job's location
 *  - company Job's company
 *  - fullTime Match full time's jobs
 * @param req
 * @param res
 */
const searchJobs = (req, res) => {
    const page = ~~Number(req.query.page) || 1;
    const { search, fullTime, location, company } = req.query;
    let query = {};

    // Full time filtering
    if (fullTime && fullTime === 'true')
        query.type = new RegExp('Full Time', 'i');

    // Location filtering
    if (location) {
        const _location = location.replace('+', ' ');
        query.location = new RegExp(_location, 'i');
    }

    if (company) {
        const _company = company.replace('+', ' ');
        query.company = new RegExp(_company, 'i');
    }

    if (search) {
        const regex = new RegExp(search, 'i');
        query['$or'] = [
            {title: regex},
            {description: regex},
            {company: regex},
            {how_to_apply: regex},
        ]
    }

    Job.paginate(
        query,
        {
            sort: {createdAt: -1},
            projection: "-description -how_to_apply",
            limit: PAGINATE_NUMBER,
            page: page,
        })
        .then(results => res.json(results))
        .catch(error => {
            logger.error("Error while looking for all jobs: " + error);
            return res.status(400).send({
                status: false,
                code: "internal-server-error",
                message: "Error while looking for jobs"
            });
        });
};

module.exports = {
    getOneJob,
    getAllJobs,
    searchJobs,
};
