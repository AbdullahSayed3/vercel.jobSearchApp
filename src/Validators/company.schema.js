import joi from "joi";

export const companySchemas = {
  addCompany: joi.object({
    companyName: joi.string().min(3).max(50).required(),
    companyEmail: joi.string().email().required(),
    description: joi.string().min(20).max(1000).required(),
    industry: joi.string().required(),
    address: joi.string().required(),
    numberOfEmployees: joi.object({
      min: joi.number().min(1).required(),
      max: joi.number().min(joi.ref('min')).required()
    }).required()
  }).required(),

  updateCompany: joi.object({
    companyName: joi.string().min(3).max(50),
    description: joi.string().min(20).max(1000),
    industry: joi.string(),
    address: joi.string(),
    numberOfEmployees: joi.object({
      min: joi.number().min(1),
      max: joi.number().min(joi.ref('min'))
    })
  }).min(1)
};