"use strict";

const express = require("express");
const router = express.Router();
const passport = require("passport");

/*** Set up the main routes ***/
router.post("/login", function (req, res, next) {
  // #swagger.tags = ['Auth']
  // #swagger.description = 'Endpoint to perform login'
  /*  #swagger.parameters['obj'] = {
                in: 'body',
                description: 'Some description...',
                schema: {
                    $username: 'buffa@test.com',
                    $password: 'password'
                }
  } */
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json(info);
    }
    // success, perform the login
    req.login(user, (err) => {
      if (err) return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUser()
      return res.json(req.user);
    });
  })(req, res, next);
});

router.get("/me", function (req, res) {
  if (!req.isAuthenticated()) {
    // not logged in
    res.status(401).json({});
    return;
  }
  // logged in, req.user contains the authenticated user
  res.json(req.user);
});

// DELETE /sessions/current
// logout
router.delete("/me", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

module.exports = router;
