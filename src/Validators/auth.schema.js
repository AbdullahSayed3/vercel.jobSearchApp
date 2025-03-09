import joi from "joi"


export const SignUpSchema = {
  body: joi.object({
        username:joi.string().min(10).max(30),
        email:joi.string().email({
            tlds:
            {
               allow: ['com','org','net']
            },
            maxDomainSegments:2
            
        }),
        password:joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*])[A-Za-z\d@$!%*]{8,}$/).messages({
            "string.pattern.base":"Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@, $, !, %, )."
        }),
        confirmpassword:joi.string().valid(joi.ref('password')),
        phone:joi.string(),
        age:joi.string(),
        gender:joi.string().valid('male','female')
  }).options({presence:'required'})
};
