import joi from "joi";

export const jobSchemas = {
  addJob: joi.object({
    jobTitle: joi.string().min(5).max(100).required(),
    jobDescription: joi.string().min(20).max(2000).required(),
    workingTime: joi.string().valid('part-time', 'full-time').required(),
    jobLocation: joi.string().valid('onsite', 'remotely', 'hybrid').required(),
    seniorityLevel: joi.string()
      .valid('Fresh', 'Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO')
      .required(),
    technicalSkills: joi.array().items(joi.string()).min(1).required(),
    companyId: joi.string().hex().length(24).required()
  }).required(),

  updateJob: joi.object({
    jobTitle: joi.string().min(5).max(100),
    jobDescription: joi.string().min(20).max(2000),
    workingTime: joi.string().valid('part-time', 'full-time'),
    jobLocation: joi.string().valid('onsite', 'remotely', 'hybrid'),
    seniorityLevel: joi.string()
      .valid('Fresh', 'Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO'),
    technicalSkills: joi.array().items(joi.string()).min(1)
  }).min(1)
};