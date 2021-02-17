const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const JobSchema = new mongoose.Schema({
    id: String,
    type: String,
    url: String,
    company: String,
    company_url: String,
    location: String,
    title: String,
    description: String,
    how_to_apply: String,
    company_logo: String,
    created_at: String,
    createdAt: Number,
}, { versionKey: false });

JobSchema.pre('save', function(next) {
    this.createdAt = new Date(this.created_at).getTime();
    next();
});

JobSchema.plugin(mongoosePaginate);

mongoose.model('Job', JobSchema);

module.exports = mongoose.model('Job');
