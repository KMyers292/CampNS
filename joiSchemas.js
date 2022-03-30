//===============================================================================================//
//                              Schemas For The Joi Middleware                                   //
//===============================================================================================//

const BaseJoi = require('joi'); // Joi is a data validator for JavaScript.
const sanitizeHtml = require('sanitize-html'); // A simple HTML form sanitizer to help prevent scripting attacks.

// Additional settings/rules for Joi.
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if(clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

//===============================================================================================//

// Joi schema for campground form validation.
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        phone: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

//===============================================================================================//

// Joi schema for review form validation.
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
});

//===============================================================================================//