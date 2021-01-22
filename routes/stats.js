const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const Application = require('../models/application');
const { isLoggedIn } = require('../middleware');
const user = require('../models/user');

router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const reqUser = await user.findOne({ username: req.user.username });

    const totalApps = await Application.countDocuments({ owner: reqUser._id })
    const acceptedApps = await Application.countDocuments({status:'Accepted', owner: reqUser._id});
    const interviewingApps = await Application.countDocuments({status:'Interviewing', owner: reqUser._id});
    const activeApps = await Application.countDocuments({status:'Active', owner: reqUser._id});
    const rejectedApps = await Application.countDocuments({status:'Rejected', owner: reqUser._id});
    res.render('applications/stats', { totalApps, acceptedApps, interviewingApps, activeApps, rejectedApps });
}));

module.exports = router;