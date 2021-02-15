// Enable .env setting
require('dotenv').config();

const port = 8508;
const express = require('express');
const app = express();

const Datastore = require('nedb');
const logger = require('./config/logger');

// The database
const devicesDB = new Datastore({ filename: './devices.db', autoload: true});

// Save new device token
app.get('/receive-token', (req, res) => {
     const { token } = req.query;
     if (token) {
         devicesDB.findOne({token}, function (err, docs) {
             if (err) {
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
                 devicesDB.insert({token}, function (err, doc) {
                     if (err) {
                         return res.status(400).json({
                             "status": false,
                             "error": "Invalid token sent"
                         });
                     }

                     res.json({
                         "status": true
                     })
                 });
             }
         });
     } else {
         res.status(400).json({
             "status": false,
             "error": "Invalid token sent"
         });
     }
});

app.listen(port, () => {
    logger.info(`App has successfully started`);
});
