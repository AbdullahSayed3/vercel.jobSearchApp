import mongoose from "mongoose";
import { hashSync } from "bcrypt";
import { Decryption, Encryption } from "../../utils/encryption.utils.js";
import {
  genderEnum,
  otpTypes,
  providersEnum,
  systemRoles,
} from "../../constants/constants.js";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String, required: [true, "Last name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email is already taken"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "This must be email",
      ],
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "system";
      },
      minlength: [6, "Password must be at least 6 characters long"],
    },
    provider: {
      type: String,
      default: providersEnum.SYSTEM,
      enum: Object.values(providersEnum),
    },
    gender: {
      type: String,
      default: genderEnum.NOT_SPECIFIED,
      enum: Object.values(genderEnum),
    },
    DOB: Date,

    mobileNumber: String,
    role: {
      type: String,
      default: systemRoles.USER,
      enum: Object.values(systemRoles),
    },
    isConfirmed: { type: Boolean, default: false },
    deletedAt: {type:Date , default:null},
    bannedAt: Date,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changeCredentialTime: Date,
    profilePic: {
      secure_url: String,
      public_id: String,
    },
    coverPic: {
      secure_url: String,
      public_id: String,
    },
    OTP: [
      {
        code: { type: String, required: true },
        type: {
          type: String,
          enum: Object.values(otpTypes),
          required: true,
        },
        expiresIn: {
          type: Date,
          required: true,
          default: () => new Date(Date.now() + 10 * 60 * 1000),
        },
      },
    ],
  },
  { timestamps: true }
);

userSchema.virtual("userName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre("save", async function () {
  const changes = this.getChanges()["$set"];
  console.log(changes);

  if (changes.password)
    this.password = hashSync(this.password, +process.env.SALT_ROUNDS);

  if (changes.mobileNumber)
    this.mobileNumber = await Encryption({
      value: this.mobileNumber,
      secretKey: process.env.ENCRYPT_SECRET_KEY,
    });
});
userSchema.post("findOne", async function (doc) {
  if (doc && doc.mobileNumber) {
    doc.mobileNumber = await Decryption({
      cipher: doc.mobileNumber,
      secretKey: process.env.ENCRYPT_SECRET_KEY,
    });
  }
});
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });
export const User = mongoose.models.User || mongoose.model("User", userSchema);
