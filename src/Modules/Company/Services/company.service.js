import { Company } from "../../../DB/Models/company.model.js";
import { cloudinary } from "../../../Config/cloudinary.config.js";

export const AddCompanyService = async (req, res) => {
  const {
    companyName,
    companyEmail,
    description,
    industry,
    address,
    numberOfEmployees,
  } = req.body;
  const { _id } = req.loggedInUser;

  // Check if required files are provided
  const logo = req.files?.logo?.[0];
  const legalAttachment = req.files?.legalAttachment?.[0];
  if (!logo || !legalAttachment) {
    return res
      .status(400)
      .json({ message: "Logo and legal attachment must be uploaded" });
  }

  // Ensure company name and email are unique
  const existingCompany = await Company.findOne({
    $or: [{ companyName }, { companyEmail }],
  });
  if (existingCompany) {
    return res
      .status(400)
      .json({ message: "Company name or email already exists" });
  }

  // Upload files to Cloudinary
  const uploadedLogo = await cloudinary().uploader.upload(logo.path, {
    folder: `${process.env.CLOUDINARY_FOLDER}/Companies/logo`,
  });
  const uploadedLegal = await cloudinary().uploader.upload(
    legalAttachment.path,
    {
      folder: `${process.env.CLOUDINARY_FOLDER}/Companies/legal`,
      resource_type: "auto", // Accept non-image files
    }
  );

  // Create company in the database
  const company = await Company.create({
    companyName,
    companyEmail,
    description,
    industry,
    address,
    numberOfEmployees,
    createdBy: _id,
    logo: {
      public_id: uploadedLogo.public_id,
      secure_url: uploadedLogo.secure_url,
    },
    legalAttachment: {
      public_id: uploadedLegal.public_id,
      secure_url: uploadedLegal.secure_url,
    },
  });

  res.status(201).json({ message: "Company created successfully", company });
};

export const UpdateCompanyService = async (req, res) => {
  const { companyId } = req.params;

  const company = await Company.findById(companyId);

  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  // Check if the user is the company owner
  if (company.createdBy.toString() !== req.loggedInUser._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const { legalAttachment, ...updateData } = req.body;

  const updatedCompany = await Company.findByIdAndUpdate(
    companyId,
    updateData,
    {
      new: true,
    }
  );
  res
    .status(200)
    .json({ message: "Company updated seuccessfully", updatedCompany });
};

export const SoftDeleteCompanyService = async (req, res) => {
  const { companyId } = req.params;
  const company = await Company.findById(companyId);
  if(!company){
    return res.status(404).json({ message: "Company not found" });
  }
  // Verify if the user is an admin or the company owner
  if (
    req.loggedInUser.role !== "admin" &&
    company.createdBy.toString() !== req.loggedInUser._id.toString()
  ) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  company.deletedAt = new Date();
  await company.save();
  res.status(200).json({ message: "Company deleted successfully" });
};

export const GetCompanyWithJobsService = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId).populate("jobs");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const SearchCompanyByNameService = async (req, res) => {

    const { name } = req.query;
    const companies = await Company.find({
      companyName: { $regex: name, $options: "i" },
    });
    res.status(200).json(companies);

};

export const UploadCompanyLogoService = async (req, res) => {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Upload logo to Cloudinary
    const uploadLogo = await cloudinary().uploader.upload(req.file.path);

    company.logo = {
      secure_url: uploadLogo.secure_url,
      public_id: uploadLogo.public_id,
    };

    await company.save();
    res.status(200).json({message:"Logo uploaded successfully.",company});

};

export const UploadCoverPicService = async (req, res) => {

    const { companyId } = req.params;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const uploadCoverPic = await cloudinary().uploader.upload(req.file.path);

    company.coverPic = {
      secure_url: uploadCoverPic.secure_url,
      public_id: uploadCoverPic.public_id,
    };

    await company.save();
    res.status(200).json({message:"Cover uploaded successfully.",company});

};

export const DeleteCompanyLogoService = async (req, res) => {
    const { companyId } = req.params;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    if (!company.coverPic || !company.logo.public_id) {
        return res.status(400).json({ message: "Logo is already deleted" });
      }
    // Delete logo from Cloudinary
    await cloudinary().uploader.destroy(company.logo.public_id);

    await Company.updateOne({ _id: companyId }, { $unset: { logo: "" } });
    
    res.status(200).json({ message: "Logo deleted successfully", company });

};

export const DeleteCoverPicService = async (req, res) => {

    const { companyId } = req.params;
    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (!company.coverPic || !company.coverPic.public_id) {
        return res.status(400).json({ message: "Cover image is already deleted" });
      }

    await cloudinary().uploader.destroy(company.coverPic.public_id);

    await Company.updateOne({ _id: companyId }, { $unset: { coverPic: "" } });

    res.status(200).json({ message: "Cover image deleted successfully" , company});

};
