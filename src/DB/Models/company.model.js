import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyName: { type: String, unique: true, required: true },
    description: { type: String },
    industry: { type: String, required: true }, 
    address: { type: String },
    numberOfEmployees: { type: String, required: true }, 
    companyEmail: { type: String, unique: true, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    logo: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url:String,
      public_id:String,
    },
    HRs: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bannedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    legalAttachment: {
      secure_url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    approvedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);
companySchema.virtual('jobs', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'companyId'
});



export const Company =mongoose.models.Company || mongoose.model("Company" , companySchema)