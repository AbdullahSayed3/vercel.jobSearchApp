import { Company } from "../../DB/Models/company.model.js";

export const CompanyResolvers = {
  Query: {
    listAllCompanies: async () => {
      return await Company.find({});
    }
  },
  Mutation: {
    banCompany: async (_, { companyId }) => {
      const company = await Company.findById(companyId);
      company.bannedAt = new Date();
      await company.save();
      return company
    },
    unbanCompany: async (_, { companyId }) => {
      const company = await Company.findById(companyId);
      company.bannedAt = null;
      await company.save();
      return company
    },
    approveCompany: async (_, { companyId }) => {
      return Company.findByIdAndUpdate(
        companyId,
        { approvedByAdmin: true },
        { new: true }
      );
    }
  }
};