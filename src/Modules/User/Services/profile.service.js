import { compareSync } from "bcrypt";
import { User } from "../../../DB/Models/user.model.js";
import BlackListTokens from "../../../DB/Models/black-list-tokens.model.js";
import { cloudinary } from "../../../Config/cloudinary.config.js";

export const UpdateProfileService = async (req, res) => {
  const { _id } = req.loggedInUser;
  const { firstName, lastName, mobileNumber, gender, DOB } = req.body;

  const user = await User.findById(_id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (gender) user.gender = gender;
  if (DOB) user.DOB = DOB;
  if (mobileNumber) user.mobileNumber = mobileNumber;

  await user.save();

  res.status(200).json({ message: "Profile updated successfully.", user });
};

export const GetLoggedInUserDataService = async (req, res) => {
  const { _id } = req.loggedInUser;
  const user = await User.findById(_id).select("-password -__v");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ message: "User data retrieved successfully", user });
};

export const GetUserProfileService = async (req, res) => {
  const { Id } = req.params;

  const user = await User.findById(Id).select(
    "firstName lastName mobileNumber profilePic coverPic "
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const userData = {
    userName: `${user.firstName} ${user.lastName}`,
    mobileNumber: user.mobileNumber,
    profilePic: user.profilePic,
    coverPic: user.coverPic,
  };
  res.status(200).json({
    message: "User profile retrieved successfully",
    userData,
  });
};

export const UpdatePasswordService = async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const { _id } = req.loggedInUser;

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "Password do not match" });
  }
  const user = await User.findById(_id).select("+password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const isPasswordMatched = compareSync(oldPassword, user.password);
  if (!isPasswordMatched) {
    return res.status(400).json({ meassage: "Invalid Password" });
  }
  user.password = newPassword;
  user.changeCredentialTime = new Date();

  await BlackListTokens.create({
    tokenId: req.loggedInUser.token.tokenId,
    expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await user.save();
  res
    .status(200)
    .json({ message: "Password updated successfully. Please log in again." });
};

export const UploadProfilePicService = async (req, res) => {
  const { _id } = req.loggedInUser;
  const { file } = req;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const { public_id, secure_url } = await cloudinary().uploader.upload(
    file.path,
    {
      folder: `${process.env.CLOUDINARY_FOLDER}/Users/profile`,
    }
  );
  const user = await User.findByIdAndUpdate(
    _id,
    { profilePic: { public_id, secure_url } },
    { new: true }
  );
  res
    .status(200)
    .json({ message: "Profile picture uploaded successfully.", user });
};

export const UploadCoverPicService = async (req, res) => {
  const { _id } = req.loggedInUser;
  const { file } = req;
  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const { public_id, secure_url } = await cloudinary().uploader.upload(
    file.path,
    {
      folder: `${process.env.CLOUDINARY_FOLDER}/Users/cover`,
    }
  );
  const user = await User.findByIdAndUpdate(
    _id,
    { coverPic: { public_id, secure_url } },
    { new: true }
  );
  res
    .status(200)
    .json({ message: "Cover picture uploaded successfully.", user });
};

export const DeleteProfilePicService = async (req, res) => {
  const { _id } = req.loggedInUser;

  const user = await User.findById(_id).select("profilePic");
  if (!user || !user.profilePic?.public_id) {
    return res.status(404).json({ message: "No profile picture to delete" });
  }

  await cloudinary().uploader.destroy(user.profilePic.public_id);

  const userUpdated = await User.findByIdAndUpdate(
    _id,
    { $unset: { profilePic: 1 } },
    { new: true }
  );

  res
    .status(200)
    .json({ message: "Profile picture deleted successfully", userUpdated });
};

export const DeleteCoverPicService = async (req, res) => {
  const { _id } = req.loggedInUser;

  const user = await User.findById(_id).select("coverPic");
  if (!user || !user.coverPic?.public_id) {
    return res.status(404).json({ message: "No cover picture found" });
  }

  await cloudinary().uploader.destroy(user.coverPic.public_id);

  const userUpdated = await User.findByIdAndUpdate(
    _id,
    { $unset: { coverPic: 1 } },
    { new: true }
  );

  res
    .status(200)
    .json({ message: "Cover picture deleted successfully", userUpdated });
};

export const SoftDeleteUserAccountService = async (req, res) => {
  const { _id } = req.loggedInUser;
  const deletedAt = new Date();
  const user = await User.findByIdAndUpdate(
    _id,
    {
      deletedAt,
      changeCredentialTime: deletedAt,
    },
    { new: true }
  );
  if (req.loggedInUser.token?.tokenId) {
  await BlackListTokens.create({
    tokenId: req.loggedInUser.token.tokenId,
    expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  }
  if (!user) {
    return res
      .status(404)
      .json({ message: "User not found or already deleted" });
  }

  res.status(200).json({
    message: "Account marked as deleted",
    restoreGuide: "Contact support to restore your account within 30 days",
  });
};
