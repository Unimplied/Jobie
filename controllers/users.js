const User = require('../models/user');


module.exports.renderRegisterForm = async (req, res) => {
    res.render('user/register');
};

module.exports.registerUser =  async (req, res) => {
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

};

module.exports.renderLoginForm =  async (req, res) => {
    res.render('user/login');
};

module.exports.loginUser = async (req, res) => {
    req.flash('success', `Welcome back, ${ req.body.username}`);
    const redirectUrl = req.session.returnTo || '/applications';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', 'You have been logged out');
    res.redirect('/login');
};

