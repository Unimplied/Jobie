const User = require('./models/user');

module.exports.isLoggedIn = ( req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in to do that');
        return res.redirect('/login');
    }
    next(); 
};

module.exports.isVerified = async(req, res, next) => {
    const user = await User.findOne({ username: req.body.username });
    if (!user){
        req.flash('error', 'User does not exist')
        return res.redirect('/register')
    }
    if (user.isVerified) {
        return next()
    } else {
    req.flash('error', 'Your account has not been verified. Please check your email to verify your account');
    return res.redirect('/login')
    }
};
