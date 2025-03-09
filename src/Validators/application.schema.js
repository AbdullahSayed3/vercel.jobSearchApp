import joi from "joi";

export const applicationSchemas = {
  applyToJob: joi.object({
    jobId: joi.string().hex().length(24).required(),
    userId: joi.string().hex().length(24).required()
  }).required(),

  updateApplication: joi.object({
    status: joi.string().valid('pending', 'accepted', 'rejected').required()
  }).required()
};