import { User } from "../../DB/Models/user.model.js";

export const UserResolvers = {
  Query: {
    listAllUsers: async () => {
      return await User.find({}).select('-password');
    }
  },
  Mutation: {
    banUser: async (_, { userId }) => {
      const user = await User.findById(userId);
      user.bannedAt = new Date();
      await user.save();
      return user
    },
    unbanUser: async (_, { userId }) => {
      const user = await User.findById(userId);
      user.bannedAt = null;
      await user.save();
      return user
    }
  }
};

