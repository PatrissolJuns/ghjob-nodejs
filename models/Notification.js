const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    params: Object,
    createdAt: String | Number,
    updatedAt: String | Number,
    deletedAt: String | Number | null,
}, { versionKey: false });

NotificationSchema.pre('save', function(next) {
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
    next();
});

NotificationSchema.pre('update', function(next) {
    this.updatedAt = Date.now();
    next();
});

mongoose.model('Notification', NotificationSchema);

module.exports = mongoose.model('Notification');
