const { signupSchema } = require("../middlewares/validator.js"); // validator schema
const User = require("../models/usersModel.js"); // db model
const { doHash } = require("../utils/hashing.js"); // password hashing model

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = await signupSchema.validateAsync({
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
    console.log(error);
  }
};
