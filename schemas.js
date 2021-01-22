const BaseJoi = require("joi");
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({ // this function reduces the risk of XSS by sanitizing HTML
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, { // the sanitizeHtml package strips html tags
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.EscapeHTML', { value })   // compares incoming string to "cleaned" string
                return clean;                                                               // if there was a difference, returns an error
            }
        }
    }
}); 

const Joi = BaseJoi.extend(extension);

 module.exports.applicationSchema = Joi.object({ // Joi schema to protect routes
    application: Joi.object({
        companyName: Joi.string().required().escapeHTML(),
        jobTitle: Joi.string().required().escapeHTML(),
        jobLocation: Joi.string().required().escapeHTML(),
        dateApplied: Joi.date()
                    // .format('MM-DD-YYYY]'])
                    // .raw()
                    // .error(() => "message")
                    .required(),
        status: Joi.string().valid('Active', 'Interviewing', 'Rejected', 'Accepted').required().escapeHTML(),
        notes: Joi.string().empty('').default('default value').optional().escapeHTML() // default value of notes is ""
    }).required()
});

 
