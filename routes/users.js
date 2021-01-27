const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');
const users = require('../controllers/users');
const { isVerified } = require('../middleware');


router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.registerUser))

router.get('/verify-email', users.verifyUser);

router.route('/login')
    .get(users.renderLoginForm)
    .post(isVerified, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser)

router.get('/logout', users.logoutUser);

module.exports = router;