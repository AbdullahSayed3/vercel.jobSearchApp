import { Router } from "express";
import * as companyServices from "./Services/company.service.js";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../../Middlewares/authentication.middleware.js";
import {
  systemRoles,
  DocumentExtensions,
  ImageExtensions,
} from "../../constants/constants.js";
import { ErrorHandler } from "../../Middlewares/error-handler.middleware.js";
import { MulterHost } from "../../Middlewares/multer.middleware.js";
const { USER, ADMIN } = systemRoles;

const companyController = Router();

companyController.use(authenticationMiddleware());

companyController.post(
  "/add-company",
  MulterHost([...ImageExtensions, ...DocumentExtensions]).fields([
    { name: "logo", maxCount: 1 },
    { name: "legalAttachment", maxCount: 1 },
  ]),
  ErrorHandler(companyServices.AddCompanyService)
);

companyController.put(
  "/update-company/:companyId",
  authorizationMiddleware([USER, ADMIN]),
  ErrorHandler(companyServices.UpdateCompanyService)
);

companyController.delete(
  "/delete-company/:companyId",
  authorizationMiddleware([ADMIN, USER]),
  ErrorHandler(companyServices.SoftDeleteCompanyService)
);

companyController.get(
  "/get-company/:companyId",
  ErrorHandler(companyServices.GetCompanyWithJobsService)
);

companyController.get(
  "/search-company",
  ErrorHandler(companyServices.SearchCompanyByNameService)
);

companyController.patch(
  "/upload-logo/:companyId",
  authenticationMiddleware(),
  MulterHost(ImageExtensions).single("logo"),
  ErrorHandler(companyServices.UploadCompanyLogoService)
);

companyController.patch(
  "/upload-cover/:companyId",
  authenticationMiddleware(),
  MulterHost(ImageExtensions).single("cover"),
  ErrorHandler(companyServices.UploadCoverPicService)
);
companyController.delete(
  "/delete-logo/:companyId",
  authenticationMiddleware(),
  ErrorHandler(companyServices.DeleteCompanyLogoService)
);

companyController.delete(
  "/delete-cover/:companyId",
  authenticationMiddleware(),
  ErrorHandler(companyServices.DeleteCoverPicService)
);

export default companyController;
