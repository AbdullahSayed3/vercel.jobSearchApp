import { Router } from "express";
import * as jobService from "./Services/job.service.js";
import {
  authenticationMiddleware,
  authorizationMiddleware,
} from "../../Middlewares/authentication.middleware.js";
import { ErrorHandler } from "../../Middlewares/error-handler.middleware.js";

const jobController = Router();

// 1. Add Job
jobController.post(
  "/add-job",
  authenticationMiddleware(),

  ErrorHandler(jobService.addJobService)
);

// 2. Update Job
jobController.patch(
  "/update-job/:jobId",
  authenticationMiddleware(),
  authorizationMiddleware(["CompanyOwner"]),
  ErrorHandler(jobService.updateJobService)
);

// 3. Delete Job
jobController.delete(
  "/delete-job/:jobId",
  authenticationMiddleware(),
  authorizationMiddleware(["HR"]),
  ErrorHandler(jobService.deleteJobService)
);

// 4. Get all Jobs or a specific one for a specific company
jobController.get("/get-all-jobs", ErrorHandler(jobService.getJobsService));

// 5. Get all Jobs with filtering
jobController.get(
  "/get-with-filter",
  ErrorHandler(jobService.getFilteredJobsService)
);

// 6. Get all applications for a specific Job
jobController.get(
  "/get-all-apps:jobId/applications",
  authenticationMiddleware(),
  authorizationMiddleware(["HR", "CompanyOwner"]),
  ErrorHandler(jobService.getJobApplicationsService)
);

// 7. Apply to Job
jobController.post(
  "/apply-job:jobId/apply",
  authenticationMiddleware(),
  authorizationMiddleware(["User"]),
  ErrorHandler(jobService.applyJobService)
);

// 8. Accept or Reject an Applicant
jobController.patch(
  "/applications/:applicationId",
  authenticationMiddleware(),
  authorizationMiddleware(["HR"]),
  ErrorHandler(jobService.acceptRejectApplicantService)
);

export default jobController;
