import { GraphQLList, GraphQLID } from "graphql";
import { CompanyType } from "../Types/company.type.js";
import { CompanyResolvers } from "../Resolvers/company.resolver.js";

export const CompanyFields = {
  Query: {
    listCompanies: {
      type: new GraphQLList(CompanyType),
      resolve: CompanyResolvers.Query.listAllCompanies
    }
  },
  Mutation: {
    banCompany: {
      type: CompanyType,
      args: { companyId: { type: GraphQLID } },
      resolve: CompanyResolvers.Mutation.banCompany
    },
    unbanCompany: {
      type: CompanyType,
      args: { companyId: { type: GraphQLID } },
      resolve: CompanyResolvers.Mutation.unbanCompany
    },
    approveCompany: {
      type: CompanyType,
      args: { companyId: { type: GraphQLID  } },
      resolve: CompanyResolvers.Mutation.approveCompany
    }
  }
};