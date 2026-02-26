const Joi = require('joi');

const verificationSchema = Joi.object({
  id: Joi.string().required().messages({
    'any.required': 'MISSING REQUIRED FIELD: id'
  }),
  mode: Joi.string().valid('existence_check', 'basic_identity', 'full_profile').required().messages({
    'any.required': 'MISSING REQUIRED FIELD: mode'
  }),
  purpose: Joi.string().min(5).required().messages({
    'any.required': 'MISSING REQUIRED FIELD: purpose'
  }),
  consent: Joi.boolean().valid(true).required().messages({
    'any.only': 'USER CONSENT REQUIRED'
  }),
  callbackUrl: Joi.string().uri().optional(),
  verificationId: Joi.string().optional(),
});

const validatePrivacy = (req, res, next) => {
  const { error } = verificationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      code: 'REQ400',
      message: error.details[0].message
    });
  }
  next();
};

module.exports = validatePrivacy;
