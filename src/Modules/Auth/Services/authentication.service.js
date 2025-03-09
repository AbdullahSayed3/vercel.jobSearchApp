import { compareSync, hashSync } from "bcrypt";
import { User } from "../../../DB/Models/user.model.js";
import { Encryption, Decryption } from "../../../utils/encryption.utils.js";
import { generateToken, verifyToken } from "../../../utils/tokens.utils.js";
import { EmailEvent } from "../../../Services/send-email.service.js";
import { v4 as uuidv4 } from "uuid";
import { otpTypes, providersEnum } from "../../../constants/constants.js";
import { OAuth2Client } from "google-auth-library";
import cron from "node-cron";

export const SignUpService = async (req, res) => {
  const { firstName, lastName, password, email, mobileNumber, gender, DOB } =
    req.body;

  // "hash and encrypt mobileNumber in mongoose hook "
  // can i check here if age <=18

  const isEmailExist = await User.findOne({ email });

  // Check if email exist or not

  if (isEmailExist) {
    return res.status(409).json({ message: "Email already exist" });
  }

  //   generate and hashed OTP
  const OTP = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOtp = hashSync(OTP, +process.env.SALT_ROUNDS);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  // Send OTP in email

  EmailEvent.emit("SendEmail", {
    to: email,
    subject: "Confirm your email",
    html: `<h1>${OTP}</h1>`,
  });

  //   create user using save method
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    mobileNumber,
    gender,
    DOB,
    OTP: [
      {
        code: hashedOtp,
        type: otpTypes.CONFIRM_Email,
        expiresIn: otpExpiry,
      },
    ],
  });
  await user.save();

  return res.status(201).json({ message: "User created successfully", user });
};

export const ConfirmEmailService = async (req, res) => {
  const { OTP, email } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.OTP.length) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  //   Check OTP expire date , OTP type and OTP value
  const otpIndex = user.OTP.findIndex(
    (otp) =>
      otp.type === otpTypes.CONFIRM_Email &&
      compareSync(OTP, otp.code) &&
      otp.expiresIn > new Date()
  );

  if (otpIndex === -1) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  await User.findByIdAndUpdate(user._id, {
    isConfirmed: true,
    $pull: { OTP: { type: otpTypes.CONFIRM_Email } },
  });

  res.status(200).json({ message: "Email confirmed successfully" });
};

export const SignInService = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.deletedAt || user.bannedAt) {
    return res.status(404).json({ message: "Invalid request" });
  }

  if (!user.isConfirmed)
    return res.status(403).json({ message: "Please Sign Up first" });

    // const isPasswordMatch = password == user.password
  const isPasswordMatch = compareSync(password, user.password);
  if (!isPasswordMatch)
    return res.status(401).json({ message: "Invalid credentials" });

  // Generate accessToken
  const accessToken = generateToken({
    publicClaims: { _id: user._id },
    registeredClaims: {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
      jwtid: uuidv4(),
    },
    secretKey: process.env.JWT_SECRET_KEY_ACCESS,
  });

  // Generate refreshToken
  const refreshToken = generateToken({
    publicClaims: { _id: user._id },
    registeredClaims: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
      jwtid: uuidv4(),
    },
    secretKey: process.env.JWT_SECRET_KEY_REFESH,
  });

  res.status(200).json({
    message: "User logged in successfully.",
    accessToken,
    refreshToken,
  });
};

export const GmailSignUpService = async (req, res) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { email_verified, email, name } = payload;

  if (!email_verified) {
    return res.status(401).json({ message: "Invalid email credentials" });
  }
  const isEmailExists = await User.findOne({ email });
  if (isEmailExists) {
    return res.status(409).json({ message: "Email already exists" });
  }
  //  Creat user
  const user = new User({
    username: name,
    profilePic: picture,
    email,
    provider: providersEnum.GOOGLE,
    password: hashSync(uuidv4(), +process.env.SALT_ROUNDS),
    isConfirmed: true,
  });
  await user.save();

  const accessToken = generateToken({
    publicClaims: { _id: user._id },
    registeredClaims: {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
      jwtid: uuidv4(),
    },
    secretKey: process.env.JWT_SECRET_KEY_ACCESS,
  });
  const refreshToken = generateToken({
    publicClaims: { _id: user._id },
    registeredClaims: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
      jwtid: uuidv4(),
    },
    secretKey: process.env.JWT_SECRET_KEY_REFESH,
  });

  res.status(200).json({
    message: "User registered successfully.",
    user,
    tokens: { accessToken, refreshToken },
  });
};

export const GmailLogInService = async (req, res) => {
  const { idToken } = req.body;
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { email_verified, email } = payload;

  if (!email_verified) {
    return res.status(401).json({ message: "Invalid email credentials" });
  }

  const user = await User.findOne({ email, provider: providersEnum.GOOGLE });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const accessToken = generateToken({
    publicClaims: { id: user._id },
    registeredClaims: {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
      jwtid: uuidv4(),
    },
    secretKey: process.env.JWT_SECRET_KEY,
  });
  const refreshToken = generateToken({
    publicClaims: { id: user._id },
    registeredClaims: {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
      jwtid: uuidv4(),
    },
    secretKey: process.env.JWT_SECRET_KEY_REFESH,
  });

  res.status(200).json({
    message: "User logged in successfully.",
    tokens: { accessToken, refreshToken },
  });
};

export const ForgetPasswordService = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return res
      .status(404)
      .json({ message: "This email is not registered, please SignUp First" });

  // Generate OTP
  const OTP = Math.floor(100000 + Math.random() * 900000).toString();

  // Send OTP to user in email
  EmailEvent.emit("SendEmail", {
    to: user.email,
    subject: "Reset your password",
    html: `<h2>Hello from Job-SearchApp </h2>
      <p>Your OTP is ${OTP} to reset yor password</b></p>`,
  });

  // Hash OTP and set expiration time (10 minutes)
  const hashedOtp = hashSync(OTP, +process.env.SALT_ROUNDS);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  const otpIndex = user.OTP.findIndex(
    (item) => item.type === otpTypes.FORGET_PASSWORD
  );

  const newOtpData = {
    code: hashedOtp,
    type: otpTypes.FORGET_PASSWORD,
    expiresIn: otpExpiry,
  };

  if (otpIndex !== -1) {
    user.OTP[otpIndex] = newOtpData;
  } else {
    user.OTP.push(newOtpData);
  }

  await user.save();
  res.status(200).json({ message: "OTP sent successfully" });
};

export const ResetPasswordService = async (req, res) => {
  const { email, OTP, password, confirmpassword } = req.body;
  if (password !== confirmpassword) {
    return res
      .status(400)
      .json({ message: "Password and Confirm Password do not match" });
  }

  const user = await User.findOne({ email });
  if (!user || user.deletedAt || user.bannedAt) {
    return res.status(404).json({ message: "Invalid request" });
  }

  const otpIndex = user.OTP.findIndex(
    (otp) =>
      otp.type === otpTypes.FORGET_PASSWORD &&
      compareSync(OTP, otp.code) &&
      otp.expiresIn > new Date()
  );

  if (otpIndex === -1) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);
  await User.findOneAndUpdate(
    { email },
    {
      password: hashedPassword,
      changeCredentialTime: new Date(),
      $pull: { OTP: { type: otpTypes.FORGET_PASSWORD } },
    }
  );
  res.status(200).json({ message: "Password reset successfully" });
};

export const RefreshTokenService = async (req, res) => {
  const { refreshtoken } = req.headers;

  if (!refreshtoken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  const decodedData = verifyToken({
    token: refreshtoken,
    secretKey: process.env.JWT_SECRET_KEY_REFESH,
  });

     const user = await User.findById(decodedData._id)
      .select('changeCredentialTime bannedAt deletedAt');

   if (!user || user.bannedAt || user.deletedAt) {
      return res.status(401).json({ message: "Invalid token" });
    }

   const tokenIssuedAt = new Date(decodedData.iat * 1000);
    if (user.changeCredentialTime > tokenIssuedAt) {
      return res.status(401).json({ message: "Session expired" });
    }

  const accessToken = generateToken({
    publicClaims: { _id: decodedData._id, email: decodedData.email },
    secretKey: process.env.JWT_SECRET_KEY_REFESH,
    registeredClaims: { expiresIn: "1h" },
  });
  res.status(200).json({ message: "Token refeshed successfully", accessToken });
};

const cleanOTPs = async () => {

    const result = await User.updateMany(
      { "OTP.expiresIn": { $lt: new Date() } },
      { $pull: { OTP: { expiresIn: { $lt: new Date() } } } }
    );
    console.log(`Cleaned ${result.modifiedCount} expired OTPs`);
  }

cron.schedule('0 */6 * * *', cleanOTPs);

