import mongoose from "mongoose";
import { statusEnum } from "../../constants/constants.js";

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userCV: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    status: {
      type: String,
      enum: Object.values(statusEnum),
      default: statusEnum.PENDING,
    },
  },
  { timestamps: true }
);
applicationSchema.virtual('jobData', {
    ref: 'Job',
    localField: 'jobId',
    foreignField: '_id',
    justOne: true
  });
export const Application =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);
