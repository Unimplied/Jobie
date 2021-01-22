const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');

const { applicationSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');
const Application = require('../models/application');


const validateApplication = (req, res, next) => { // application validation middleware using Joi
    const { error } = applicationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const applications = await Application.find({});
    res.render('applications/index', { applications } )
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('applications/new')
});

// router.post('/applications', async (req, res) => {
//     res.send(req.body.application);
// });

router.post('/', isLoggedIn, validateApplication, catchAsync(async (req, res, next) => {
    const application = new Application(req.body.application);
    // console.log(application);
    await application.save();
    req.flash('success', 'Successfully made a new application')
    res.redirect(`/applications/${application._id}`);
}));

router.get('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const application = await Application.findById(req.params.id);
    if(!application){
        req.flash('error', 'Cannot find that application. Was it deleted?')
        return res.redirect('/applications')
    }
    res.render('applications/details', { application });
}));

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const application = await Application.findById(req.params.id);
    res.render('applications/edit', { application });
}));

router.put('/:id', isLoggedIn, validateApplication, catchAsync(async (req, res) => {
    const { id } = req.params;
    const application = await Application.findByIdAndUpdate(id, { ...req.body.application });
    req.flash('success', 'Successfully edited application');
    res.redirect(`/applications/${application._id}`);
}));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Application.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted application');
    res.redirect('/applications');
}));

module.exports = router;