const axios = require('axios');
const BASE = 'https://jobs.github.com/';

/**
 * Get all jobs of a given page
 * @param page
 * @returns {Promise<T | never>}
 */
const getAllJobs = (page = 1) => {
    return axios
        .get(`${BASE}positions.json?page=${page}`)
        .then(result => Promise.resolve(result.data))
        .catch(error => Promise.reject(error));
};

/**
 * Fill in database
 * @param db
 * @param page
 * @param data
 * @returns {Promise<void>}
 */
const populate = async (db, page = 1, data = []) => {
    try {
        let pageData = await getAllJobs(page);
        pageData = pageData.map(job => ({...job, createdAt: new Date(job.created_at).getTime()}));

        if (pageData.length > 0) {
            await populate(db, page + 1, [ ...pageData, ...data]);
        } else {
            db.insert(data, function (err, newDocs) {});
        }
    } catch (e) {}
};

/**
 * Check if given jobs are in the database
 * @param db
 * @param ids array of Job's id
 * @returns {Promise<any>}
 */
const matchingIdItems = (db, ids) => {
    return new Promise((resolve, reject) => {
        db.find({ id: { $in: ids } }, function (err, docs) {
            return err ? reject(null) : resolve(docs);
        });
    });
};

/**
 * Get new jobs
 * @param db
 * @returns {Promise<*>}
 */
const getNewJobs = async (db) => {
    return new Promise(async (resolve, reject) => {
        const newJobs = [];
        const _getNewJobs = async (db, page = 1, newJobs = []) => {
            const pageData = await getAllJobs(page);
            // Stop the recursion in case there's no more data
            if (pageData.length === 0) {
                return resolve(newJobs);
            }

            // Get jobs that are in the database
            const _matchingIdItems = await matchingIdItems(db, pageData.map(i => i.id));

            // Get new one i.e those that are not in the database
            const _newJobs = pageData.filter(j => _matchingIdItems.find(job => job.id === j.id) === undefined);

            // Perform another fetch while saving new jobs
            return _getNewJobs(db, page + 1, [...newJobs, ..._newJobs]);
        };
        await _getNewJobs(db, 1, newJobs);
        resolve(newJobs);
    })
};

/**
 * Save a given jobs into the database
 * @param db
 * @param jobs
 * @returns {Promise<any>}
 */
const saveNewJobs = (db, jobs) => {
    return new Promise((resolve, reject) => {
        const _jobs = jobs.map(job => ({...job, createdAt: new Date(job.created_at).getTime()}));
        db.insert(_jobs, function (err, newDocs) {
            if (err) return reject(err);
            return resolve(newDocs);
        });
    })
};

module.exports = {
    populate,
    getAllJobs,
    getNewJobs,
    saveNewJobs,
    matchingIdItems,
};
