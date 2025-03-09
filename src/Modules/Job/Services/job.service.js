// export const addJob = async (req, res) => {

//       const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills, companyId } = req.body;
  

//       const company = await Company.findById(companyId);
//       if (!company) {
//         return res.status(404).json({ message: "Company not found" });
//       }
  
//       const userRole = req.loggedInUser.role;
//       if (userRole !== "HR" && userRole !== "Owner") {
//         return res.status(403).json({ message: "Unauthorized to create a job" });
//       }
  
//       const job = await Job.create({
//         jobTitle,
//         jobLocation,
//         workingTime,
//         seniorityLevel,
//         jobDescription,
//         technicalSkills,
//         softSkills,
//         addedBy: req.loggedInUser._id,
//         companyId,
//       });
  
//       res.status(201).json({ message: "Job created successfully", job });

//   };
//   export const updateJob = async (req, res) => {

//       const { id } = req.params;
//       const job = await Job.findById(id);
      
//       if (!job) {
//         return res.status(404).json({ message: "Job not found" });
//       }
  
//       // التأكد أن المستخدم هو HR أو Owner للشركة
//       if (req.loggedInUser.role !== "HR" && req.loggedInUser.role !== "Owner") {
//         return res.status(403).json({ message: "Unauthorized to update this job" });
//       }
  
//       const updatedJob = await Job.findByIdAndUpdate(
//         id,
//         { ...req.body, updatedBy: req.loggedInUser._id },
//         { new: true }
//       );
  
//       res.status(200).json(updatedJob);

//   };
//   export const deleteJob = async (req, res) => {

//       const { id } = req.params;
//       const job = await Job.findById(id);
      
//       if (!job) {
//         return res.status(404).json({ message: "Job not found" });
//       }
  
//       // التأكد أن المستخدم هو HR أو Owner
//       if (req.loggedInUser.role !== "HR" && req.loggedInUser.role !== "Owner") {
//         return res.status(403).json({ message: "Unauthorized to delete this job" });
//       }
  
//       job.closed = true;
//       await job.save();
  
//       res.status(200).json({ message: "Job closed successfully" });
//   };
//   export const getJobs = async (req, res) => {

//       const { companyName, workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills, page = 1, limit = 10 } = req.query;
  
//       let filter = { closed: false };
  
//       if (companyName) {
//         const company = await Company.findOne({ name: new RegExp(companyName, "i") });
//         if (company) {
//           filter.companyId = company._id;
//         }
//       }
  
//       if (workingTime) filter.workingTime = workingTime;
//       if (jobLocation) filter.jobLocation = jobLocation;
//       if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
//       if (jobTitle) filter.jobTitle = new RegExp(jobTitle, "i");
//       if (technicalSkills) filter.technicalSkills = { $in: technicalSkills.split(",") };
  
//       const totalCount = await Job.countDocuments(filter);
  
//       const jobs = await Job.find(filter)
//         .skip((page - 1) * limit)
//         .limit(Number(limit))
//         .sort({ createdAt: -1 })
//         .populate("companyId");
  
//       res.status(200).json({ totalCount, jobs });

//   };
//   export const applyToJob = async (req, res) => {

//       const { jobId } = req.body;
  
//       const job = await Job.findById(jobId);
//       if (!job) {
//         return res.status(404).json({ message: "Job not found" });
//       }
  
//       if (req.loggedInUser.role !== "User") {
//         return res.status(403).json({ message: "Only users can apply to jobs" });
//       }
  
//       job.applicants.push(req.loggedInUser._id);
//       await job.save();

//       io.to(job.companyId.toString()).emit("newApplication", { jobId, applicant: req.loggedInUser });
  
//       res.status(200).json({ message: "Applied successfully" });

//   };
  


// src/Modules/Job/Services/job.service.js
import { Job } from "../../../DB/Models/job.model.js";
import { Company } from "../../../DB/Models/company.model.js";
import { Application } from "../../../DB/Models/application.model.js";


// Add Job
export const addJobService  = async (req, res) => {

    const { companyId } = req.params;
    const company = await Company.findById(companyId);
    
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    
    if (!company.HRs.includes(req.loggedInUser._id) && company.createdBy.toString() !== req.loggedInUser._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const job = new Job({ ...req.body, companyId, addedBy: req.loggedInUser._id });
    await job.save();
    res.status(201).json({ message: "Job created successfully", job });

};

// Update Job
export const updateJobService  = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    const company = await Company.findById(job.companyId);
    if (company.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    Object.assign(job, req.body);
    job.updatedBy = req.user._id;
    await job.save();
    res.status(200).json({ message: "Job updated successfully", job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Job
export const deleteJobService  = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    const company = await Company.findById(job.companyId);
    if (!company.HRs.includes(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await job.deleteOne();
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Jobs or specific one for a specific company
export const getJobsService  = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 10, sort = "createdAt", name } = req.query;
    const filter = companyId ? { companyId } : {};
    if (name) {
      filter.jobTitle = { $regex: name, $options: "i" };
    }
    
    const jobs = await Job.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ [sort]: -1 });
    
    const total = await Job.countDocuments(filter);
    res.status(200).json({ total, jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Jobs with Filters
export const getFilteredJobsService  = async (req, res) => {
  try {
    const { workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills } = req.query;
    const filter = {};
    if (workingTime) filter.workingTime = workingTime;
    if (jobLocation) filter.jobLocation = jobLocation;
    if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
    if (jobTitle) filter.jobTitle = { $regex: jobTitle, $options: "i" };
    if (technicalSkills) filter.technicalSkills = { $in: technicalSkills.split(",") };

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get all applications for a specific job
export const getJobApplicationsService  = async (req, res) => {
    try {
      const { jobId } = req.params;
      
      // التأكد من أن الوظيفة موجودة
      const job = await Job.findById(jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });
  
      // التأكد أن الطلبات يمكن رؤيتها فقط من قبل الـ HR أو صاحب الشركة
      const company = await Company.findById(job.companyId);
      if (!company.HRs.includes(req.user._id) && company.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }
  
      // **جلب الطلبات مع بيانات المستخدم**
      const { page = 1, limit = 10, sort = "createdAt" } = req.query;
      const applications = await Application.find({ jobId })
        .populate("userId", "name email") // جلب بيانات المستخدم بدلًا من userId فقط
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ [sort]: -1 });
  
      const total = await Application.countDocuments({ jobId });
  
      res.status(200).json({ total, applications });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
// Apply to Job
export const applyJobService = async (req, res) => {
  try {
    const { jobId } = req.params;
    const application = new Application({ jobId, userId: req.user._id });
    await application.save();
    io.emit("newApplication", { jobId, user: req.user });
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept or Reject an Applicant
export const acceptRejectApplicantService = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const application = await Application.findById(applicationId).populate("userId");
    if (!application) return res.status(404).json({ message: "Application not found" });

    application.status = status;
    await application.save();
    sendEmail(application.userId.email, `Application ${status}`, `Your application has been ${status}`);
    res.status(200).json({ message: "Application status updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
