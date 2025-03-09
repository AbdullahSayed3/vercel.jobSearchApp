import { GraphQLID, GraphQLList } from "graphql";
import { UserType } from "../Types/user.type.js";
import { UserResolvers } from "../Resolvers/user.resolver.js";

export const UserFields = {
  Query: {
    listUsers: {
      type: new GraphQLList(UserType),
      resolve: UserResolvers.Query.listAllUsers,
    },
  },
  Mutation: {
    banUser: {
      type: UserType,
      args: { userId: { type: GraphQLID  } },
      resolve: UserResolvers.Mutation.banUser,
    },
    unbanUser: {
      type: UserType,
      args: { userId: { type: GraphQLID } },
      resolve: UserResolvers.Mutation.unbanUser,
    },
  },
};
