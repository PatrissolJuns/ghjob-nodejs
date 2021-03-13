// Enable .env setting
require('dotenv').config();
// Initialization of database
require("./mongodb").initMongoDb();

// Express setup
const app = require('express')();
const bodyParser = require('body-parser');
const port = Number(process.env.PORT) || 8504;

// Logging tool
const logger = require('./config/logger');

// API
const {saveNewError} = require("./errors");
const {getOneJob, getAllJobs, searchJobs} = require("./jobs");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// API definition
app.get('/jobs', getAllJobs);
app.get('/jobs/:id', getOneJob);
app.get('/jobs/search', searchJobs);

// Save potentials error on fetching
app.post('/errors', saveNewError);

// Save new device token
app.get('/receive-token', (req, res) => {
     const { token } = req.query;
     const Device = require('./models/Device');
     if (token) {
         Device.findOne({token}, function (err, docs) {
             if (err) {
                 logger.error("Error while trying to look for a sent token into the database " + err);
                 return res.status(400).json({
                     "status": false,
                     "error": "Invalid token sent"
                 });
             }

             if (docs) {
                 res.json({
                     "status": true,
                     "code": "DUPLICATED_TOKEN",
                     "message": "Token already exists"
                 });
             } else {
                 const device = new Device({token});
                 device
                     .save()
                     .then(() => {
                         logger.info("A new device has been registered");
                         res.json({
                             "status": true
                         });
                     })
                     .catch(err => {
                         logger.error("Error while trying to register a new device " + err);
                         return res.status(400).json({
                             "status": false,
                             "error": "Invalid token sent"
                         });
                     });
             }
         });
     } else {
         res.status(400).json({
             "status": false,
             "code": "INVALID_TOKEN",
             "error": "Invalid token sent"
         });
     }
});

app.get('/', (req, res) => {
    res.json("Welcome to GhJob's API");
});

app.listen(port, () => {
    logger.info(`App has successfully started on port ${port}`);
});
