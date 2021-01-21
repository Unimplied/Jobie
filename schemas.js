const Joi = require("joi");

 module.exports.applicationSchema = Joi.object({ // Joi schema to protect routes
    application: Joi.object({
        companyName: Joi.string().required(),
        jobTitle: Joi.string().required(),
        jobLocation: Joi.string().required(),
        dateApplied: Joi.date()
                    // .format('MM-DD-YYYY]'])
                    // .raw()
                    // .error(() => "message")
                    .required(),
        status: Joi.string().required(),
        notes: Joi.string()
    }).required()
});

 
