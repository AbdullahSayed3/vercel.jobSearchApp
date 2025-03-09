import mongoose from "mongoose";
import { jobLocationEnum, seniorityLevelEnum, workingTimeEnum } from "../../constants/constants.js";

export const jobSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true }, 
    jobLocation: {
      type: String,
      enum: Object.values(jobLocationEnum),
      required: true,
    },
    workingTime: {
      type: String,
      enum: Object.values(workingTimeEnum),
      required: true,
    },
    seniorityLevel: {
      type: String,
      enum:Object.values(seniorityLevelEnum) ,
      required: true,
    },
    jobDescription: { type: String, required: true },
    technicalSkills: [{ type: String, required: true }], 
    softSkills: [{ type: String, required: true }], 
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    closed: { type: Boolean, default: false },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  },
  { timestamps: true }
);

export const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);


