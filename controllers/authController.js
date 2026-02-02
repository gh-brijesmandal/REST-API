const { exist } = require("joi");
const { signupSchema, signinSchema } = require("../middlewares/validator.js"); // validator schema
const User = require("../models/usersModel.js"); // db model
const { doHash, doHashValidation } = require("../utils/hashing.js"); // password hashing model
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = signupSchema.validate({
      email: email,
      password: password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "User Already exists!",
      });
    }

    const hashedPassword = await doHash(password, 12);

    const newUser = new User({
      email: email,
      password: hashedPassword,
    });

    const result = await newUser.save();
    result.password = undefined; // to not share password for the request

    return res.status(201).json({
      success: true,
      message: "Your accound has been created!",
      result,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = signinSchema.validate({
      email: email,
      password: password,
    });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({
      email: email,
    }).select("+password");

    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist!" });
    }

    const result = await doHashValidation(password, existingUser.password);

    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials!" });
    }

    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        verified: existingUser.verified,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "8h",
      },
    );

    res
      .cookie("Authorization", "Bearer" + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        success: true,
        token: token,
        message: "Logged in successfully!",
      });
  } catch (err) {
    console.log(err);
  }
};

exports.signout = async (req, res) => {
  return res.clearCookie("Authorization").status(200).json({
    success: true,
    message: "Logged Out Successfully!",
  });
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "User does not exist!",
      });
    }

    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "You are already verified!" });
    }

    const codeValue = Math.floor(Math.random() * 1000000).toString();
  } catch (err) {
    console.log(err);
  }
};
