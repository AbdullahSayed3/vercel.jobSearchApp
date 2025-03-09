import { verifyToken } from "../utils/tokens.utils.js";
import BlackListTokens from "../DB/Models/black-list-tokens.model.js";
import { User } from "../DB/Models/user.model.js";
import jwt from "jsonwebtoken";

export const authenticationMiddleware = () => {
  return async (req, res, next) => {
    try {
      const { accesstoken } = req.headers;
      if (!accesstoken)
        return res.status(400).json({ message: "Please login first" });

      // Verify the token
      const decodedToken = verifyToken({
        token: accesstoken,
        secretKey: process.env.JWT_SECRET_KEY_ACCESS,
      });
      // Check if token blacklisted or not
      const isTokenBlackListed = await BlackListTokens.findOne({
        tokenId: decodedToken.jti,
      });
      if (isTokenBlackListed) {
        return res
          .status(401)
          .json({
            message:
              "This token is expired , Please login again to generate a correct token",
          });
      }

      // GEt data from database
      const user = await User.findById(decodedToken._id, "-password -__v");
      if (!user) {
        return res.status(401).json({ message: "Please signup" });
      }
      if (user.deletedAt || user.bannedAt) {
        let message = "Account ";
        if (user.bannedAt) message += "Banned";
        if (user.deletedAt) message += "Deleted";
        return res.status(403).json({
          message,
        });
      }
      // Add user data to request
      req.loggedInUser = {
        ...user._doc,
        token: { tokenId: decodedToken.jti, expiresAt: decodedToken.exp },
      };

      next();
    } catch (error) {
      console.log(error);
      if (error instanceof jwt.JsonWebTokenError)
        return res
          .status(401)
          .json({
            message:
              "This token is expired , Please login again to generate a correct token",
          });
      return res.status(500).json({ message: "Somthing went wrong" });
    }
  };
};

export const authorizationMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { role: loggedInUserRole } = req.loggedInUser;
      const isRoleAllowed = allowedRoles.includes(loggedInUserRole);

      if (!isRoleAllowed) {
        return res.status(401).json({ message: "unauthorized" });
      }

      next();
    } catch (error) {
      console.log("Authorization error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  };
};

// allowedroles ['User' , 'Admin']
