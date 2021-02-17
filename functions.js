const axios = require('axios');
const Job = require('./models/Job');
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
 * @param page
 * @param data
 * @returns {Promise<Document<any>>}
 */
const populate = async (page = 1, data = []) => {
    try {
        let pageData = await getAllJobs(page);
        pageData = pageData.map(job => ({...job, createdAt: new Date(job.created_at).getTime()}));

        if (pageData.length > 0) {
            return await populate(page + 1, [ ...pageData, ...data]);
        } else return Job.insertMany(data);
    } catch (e) {
        return Promise.reject(e);
    }
};

/**
 * Check if given jobs are in the database
 * @param ids array of Job's id
 * @returns {Promise<any>}
 */
const matchingIdItems = (ids) => {
    return new Promise((resolve, reject) => {
        Job.find({ id: { $in: ids } }, function (err, docs) {
            return err ? reject(null) : resolve(docs);
        });
    });
};

/**
 * Get new jobs
 * @returns {Promise<*>}
 */
const getNewJobs = async (page = 1, newJobs = []) => {
    let pageData, _matchingIdItems;
    try {
        pageData = await getAllJobs(page);
    } catch (e) {
        return Promise.reject(e);
    }

    // Stop the recursion in case there's no more data
    if (pageData.length === 0) {
        return Promise.resolve(newJobs);
    }

    // Get jobs that are in the database
    try {
        _matchingIdItems = await matchingIdItems(pageData.map(i => i.id));
    } catch (e) {
        return Promise.reject(e);
    }

    // Get new one i.e those that are not in the database
    const _newJobs = pageData.filter(j => _matchingIdItems.find(job => job.id === j.id) === undefined);

    // Perform another fetch while saving new jobs
    return await getNewJobs(page + 1, [...newJobs, ..._newJobs]);
};

/**
 * Save a given jobs into the database
 * @param jobs
 * @returns {Promise<any>}
 */
const saveNewJobs = (jobs) => {
    return new Promise((resolve, reject) => {
        const _jobs = jobs.map(job => ({...job, createdAt: new Date(job.created_at).getTime()}));
        Job.insertMany(_jobs)
            .then((docs) => resolve(docs))
            .catch((error) => reject(error));
    });
};

module.exports = {
    populate,
    getAllJobs,
    getNewJobs,
    saveNewJobs,
    matchingIdItems,
};
