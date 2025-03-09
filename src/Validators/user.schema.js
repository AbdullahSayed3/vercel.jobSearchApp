import joi from "joi";

export const userSchemas = {
  signUp: joi.object({
    username: joi.string().min(3).max(30).required(),
    email: joi.string().email({ 
      tlds: { allow: ['com', 'net', 'org'] },
      maxDomainSegments: 2
    }).required(),
    password: joi.string()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
      }),
    confirmPassword: joi.string().valid(joi.ref('password')).required(),
    phone: joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    age: joi.number().min(18).max(100).required(),
    gender: joi.string().valid('male', 'female').required()
  }).required(),

  login: joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
  }).required()
};