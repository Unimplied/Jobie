const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const applications = require('../controllers/applications');
const { applicationSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

const validateApplication = (req, res, next) => { // application validation middleware using Joi
    const { error } = applicationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.route('/')
    .get( isLoggedIn, catchAsync(applications.index))
    .post( isLoggedIn, validateApplication, catchAsync(applications.newApplication))

router.get('/new', isLoggedIn, applications.renderNewForm);

router.route('/:id')
    .get(isLoggedIn, catchAsync(applications.displayApplication))
    .put(isLoggedIn, validateApplication, catchAsync(applications.editApplication))
    .delete(isLoggedIn, catchAsync(applications.deleteApplication))

router.get('/:id/edit', isLoggedIn, catchAsync(applications.renderEditForm));

module.exports = router;