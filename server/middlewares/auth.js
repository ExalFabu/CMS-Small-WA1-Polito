'use strict';

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  return res.status(401).json({ error: "Not authenticated" });
};

const isRole = (role) => {
  if (!Array.isArray(role)) role = [role];
  return (req, res, next) => {
    console.log("isRole", req.user, role);
    if (req.isAuthenticated() && role.includes(req.user.role)) return next();
    else return res.status(401).json({ error: "Not authorized" });
  };
};
const isAdmin = isRole("admin");
const isUser = isRole("user");
const isEditor = isRole("editor");

module.exports = { isLoggedIn, isAdmin, isUser, isEditor, isRole };