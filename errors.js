const Datastore = require('nedb');
// The database
const logger = require('./config/logger');
const errorsDB = new Datastore({ filename: './errors.db', autoload: true});

/**
 * Save incoming error from mobile
 * @param req
 * @param res
 */
const saveNewError = (req, res) => {
    const error = req.body ? req.body.error : null;
    if (error) {
        const doc = {
            error,
            createdAt: Date.now(),
        };
        errorsDB.insert(doc, function (err, newDoc) {
            if (err) {
                logger.error("Error saving new error: " + err);
                return res.status(500).json({
                    status: true,
                    error: err,
                    code: "internal-server-error",
                    message: 'Something went wrong'
                });
            }
            res.json({
                status: true,
                data: newDoc
            });
        });
    } else {
        res.status(400).json({
            status: true,
            code: "field-required",
            message: 'Field error is required'
        });
    }
};

module.exports = {
    saveNewError
};
