const Joi = require("joi");

exports.signupSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(60)
    .required()
    .email({
      tlds: {
        allow: ["com", "net", "edu"],
      },
    }),
  password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{8,30}$")),
});

exports.signinSchema = Joi.object({
  email: Joi.string()
    .min(5)
    .max(60)
    .required()
    .email({
      tlds: {
        allow: ["com", "net", "edu"],
      },
    }),
  password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{8,30}$")),
});
