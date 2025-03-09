import { Router } from "express";
import * as authServices from "./Services/authentication.service.js";
import { ErrorHandler } from "../../Middlewares/error-handler.middleware.js";
import { validate } from "../../Middlewares/validation.middleware.js";
import { userSchemas } from "../../Validators/index.js";
const authRouter = Router();

// Auth routers
authRouter.post("/signup",validate(userSchemas.signUp), ErrorHandler(authServices.SignUpService));
authRouter.patch("/confirm-email",ErrorHandler(authServices.ConfirmEmailService))
authRouter.post("/signin", ErrorHandler(authServices.SignInService));
authRouter.post("/refresh-token", ErrorHandler(authServices.RefreshTokenService));
// Gmail routers
authRouter.post("/gmail-signup", ErrorHandler(authServices.GmailSignUpService))
authRouter.post("/gmail-login", ErrorHandler(authServices.GmailLogInService))

// Forget and Reset Password routers
authRouter.patch("/forget-password", ErrorHandler(authServices.ForgetPasswordService));
authRouter.put("/reset-password", ErrorHandler(authServices.ResetPasswordService));


export default authRouter