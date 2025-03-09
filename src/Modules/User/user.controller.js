import { Router } from "express";
import * as userServices from "./Services/profile.service.js";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../../Middlewares/authentication.middleware.js";
import { systemRoles, ImageExtensions } from "../../constants/constants.js";
import { ErrorHandler } from "../../Middlewares/error-handler.middleware.js";
import { MulterHost } from "../../Middlewares/multer.middleware.js";
const { USER, ADMIN } = systemRoles;

const userController = Router();

userController.use(authenticationMiddleware());
userController.get(
  "/get-another-user/:Id",
  authorizationMiddleware([USER, ADMIN]),
  ErrorHandler(userServices.GetUserProfileService)
);

userController.put(
  "/update-profile",
  ErrorHandler(userServices.UpdateProfileService)
);
userController.get(
  "/get-profile",
  authorizationMiddleware([USER]),
  ErrorHandler(userServices.GetLoggedInUserDataService)
);
userController.patch(
  "/update-password",
  authorizationMiddleware([USER]),
  ErrorHandler(userServices.UpdatePasswordService)
);
userController.patch(
  "/upload_profilepic",
  authenticationMiddleware(),
  MulterHost(ImageExtensions).single("profile"),
  ErrorHandler(userServices.UploadProfilePicService)
);
userController.patch(
  "/upload_coverpic",
  authenticationMiddleware(),
  MulterHost(ImageExtensions).single("cover"),
  ErrorHandler(userServices.UploadCoverPicService)
);

userController.delete(
  "/delete_profilepic",
  authenticationMiddleware(),
  ErrorHandler(userServices.DeleteProfilePicService)
);
userController.delete(
  "/delete_coverpic",
  authenticationMiddleware(),
  ErrorHandler(userServices.DeleteCoverPicService)
);
userController.delete(
  "/delete_user",
  authenticationMiddleware(),
  ErrorHandler(userServices.SoftDeleteUserAccountService)
);
// userController.get("/profile",authorizationMiddleware([USER]),ErrorHandler(userServices.ProfileServices));
// userController.get("/list-users",authorizationMiddleware(ADMIN_USER), ErrorHandler(userServices.ListUsersServices));

export default userController;
