const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
    companyName: String,
    jobTitle: String,
    jobLocation: String,
    dateApplied: Date,
    status: String,
});

module.exports = mongoose.model('Application', ApplicationSchema);