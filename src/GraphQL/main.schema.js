import { GraphQLSchema, GraphQLObjectType } from "graphql";
import { UserFields } from "./Fields/user.fields.js";
import { CompanyFields } from "./Fields/company.fields.js";


export const mainSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "MainQuery",
    fields: {
      ...UserFields.Query,
      ...CompanyFields.Query,
    },
  }),
  mutation: new GraphQLObjectType({
    name: "MainMutation",
    fields: {
      ...UserFields.Mutation,
      ...CompanyFields.Mutation,
    },
  }),
});
