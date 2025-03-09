import pkg from 'express'
const { NextFunction, Request, Response } = pkg;

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.context.label,
        message: detail.message
      }));
      
      return res.status(400).json({ errors });
    }
    
    next();
  };
};