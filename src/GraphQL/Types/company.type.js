import { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLBoolean } from "graphql";

export const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLID },
    companyName: { type: GraphQLString },
    approvedByAdmin: { type: GraphQLBoolean }, 
    bannedAt: { type: GraphQLString } 
  })
});