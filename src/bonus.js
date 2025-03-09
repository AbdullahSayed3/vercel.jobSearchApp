// LeetCode Problem: Jump Game


function canJump(nums) {
    let maxReach = 0;
    
    for (let i = 0; i < nums.length; i++) {
        if (i > maxReach) return false; 
        maxReach = Math.max(maxReach, i + nums[i]); 
        
        if (maxReach >= nums.length - 1) return true; 
    }
    
    return false; 
}



// Example Test Cases
console.log(canJump([2,3,1,1,4])); // true
console.log(canJump([3,2,1,0,4])); // false

module.exports = canJump;


//======================================
import express from "express";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import JobApplication from "../models/JobApplication.js";
import Company from "../models/Company.js";
import { authorizationMiddleware } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/export-applications/:companyId/:date", authorizationMiddleware(["admin", "hr", "owner"]), async (req, res) => {
  try {
    const { companyId, date } = req.params;
    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

   
    const applications = await JobApplication.find({
      companyId,
      createdAt: { $gte: selectedDate, $lt: nextDay },
    }).populate("userId", "name email phone");

    if (applications.length === 0) {
      return res.status(404).json({ message: "No applications found for this date" });
    }

   
    const data = applications.map((app) => ({
      ApplicantName: app.userId.name,
      Email: app.userId.email,
      Phone: app.userId.phone,
      JobTitle: app.jobTitle,
      Status: app.status,
      AppliedAt: app.createdAt.toISOString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

 
    const filePath = path.join("./exports", `Applications_${companyId}_${date}.xlsx`);
    XLSX.writeFile(workbook, filePath);

    res.status(200).json({ message: "Excel file generated", downloadUrl: `/exports/${path.basename(filePath)}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
