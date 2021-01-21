const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const Application = require('../models/application');

router.get('/', catchAsync(async (req, res) => {
    const totalApps = await Application.countDocuments({})
    const acceptedApps = await Application.countDocuments({status:'Accepted'});
    const interviewingApps = await Application.countDocuments({status:'Interviewing'});
    const activeApps = await Application.countDocuments({status:'Active'});
    const rejectedApps = await Application.countDocuments({status:'Rejected'});
    res.render('applications/stats', { totalApps, acceptedApps, interviewingApps, activeApps, rejectedApps });
}));

module.exports = router;