const User = require('../models/user');
const nodemailer = require("nodemailer"); // npm package to send emails from the app
const crypto = require('crypto');


module.exports.renderRegisterForm = async (req, res) => {
    res.render('user/register');
};

module.exports.registerUser =  async (req, res) => {
    const {email, username, password} = req.body;
    const emailToken = crypto.randomBytes(64).toString('hex');
    const user = new User({email, username, emailToken, isVerified: false});
    const registeredUser = await User.register(user, password);

    // reusable transporter object
    let transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    
    const url = `https://${req.headers.host}/verify-email?token=${user.emailToken}`;
    // send mail with defined transport object
    let info = await transport.sendMail({
        from: "Alex @ Jobie" <"jobie.@example.com",
        to: req.body.email,
        subject: "email Verification",
        text: `Please verify your email at ${url}`,
        html: `Please verify your email at <a href="${url}">this link</a>`
    });

    req.flash('success', 'Welcome to Jobie. Please verify your email to continue');
    res.redirect('/login');
};


module.exports.verifyUser = async(req, res, next) => {
    const user = await User.findOne({ emailToken: req.query.token });
    if (!user) {
        req.flash('error', 'Token is invalid. Please contact us for assistance.')
        return res.redirect('/register');
    } 
    user.emailToken = null;
    user.isVerified = true;
    await user.save();
    
    await req.login(user, async (err) => {
        if (err) return next(err);
        req.flash('success', `Welcome to Jobie, ${user.username}`);
        res.redirect('/applications');
    });
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

