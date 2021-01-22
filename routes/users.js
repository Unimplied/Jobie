const express = require('express');
const User = require('../models/user');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const passport = require('passport');

router.get('/register', async (req, res) => {
    res.render('user/register');
});

router.post('/register', catchAsync( async (req, res) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Jobie')
            res.redirect('/applications');
        })    
    } catch (e){
        req.flash('error', e.message);
        res.redirect('register');
    }

}));

router.get('/login', async (req, res) => {
    res.render('user/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), async (req, res) => {
    req.flash('success', `Welcome back, ${ req.body.username}`);
    const redirectUrl = req.session.returnTo || '/applications';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You have been logged out');
    res.redirect('/login');
})

module.exports = router;