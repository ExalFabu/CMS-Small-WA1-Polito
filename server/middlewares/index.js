const authMiddleware = require("./auth");
const { check } = require("express-validator");

module.exports = {
  ...authMiddleware,
  check,
};
