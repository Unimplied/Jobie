const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const { isLoggedIn } = require('../middleware');
const stats = require('../controllers/stats');


router.get('/', isLoggedIn, catchAsync( stats.getUserStats ));

module.exports = router;