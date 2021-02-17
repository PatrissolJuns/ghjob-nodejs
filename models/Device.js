const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
    token: {
        type: String,
        unique: true,
        required: [true, "The token field is required"],
    },
    createdAt: String | Number,
    updatedAt: String | Number,
    deletedAt: String | Number | null,
}, { versionKey: false });

DeviceSchema.pre('save', function(next) {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    next();
});

DeviceSchema.pre('update', function(next) {
    this.updatedAt = Date.now();
    next();
});

mongoose.model('Device', DeviceSchema);

module.exports = mongoose.model('Device');
