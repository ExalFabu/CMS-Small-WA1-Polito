"use strict";

const express = require("express");
const router = express.Router();
const passport = require("passport");
const { isLoggedIn } = require("../middlewares");

/*** Set up the main routes ***/
router.post("/login", function (req, res, next) {
  // #swagger.tags = ['User']
  // #swagger.description = 'Endpoint to perform login'
  /*  #swagger.parameters['Credentials'] = {
                in: 'body',
                description: 'Credential to use for login', 
                schema: {
                    $username: 'buffa@test.com',
                    $password: 'password'
                }
  } 
      #swagger.responses[200] = {
          description: 'User successfully logged in',
          schema: { $ref: "#/definitions/User"},
          headers: {
              'Set-Cookie': {
                  schema: {
                      type: 'string'
                  },
                  description: 'Cookie with session id'
              }
          }
      }
      #swagger.responses[401] = {
          description: 'Wrong credentials',
          schema: { $ref: "#/definitions/Error" }
      }
  */

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
  // #swagger.tags = ['User']
  // #swagger.description = 'Endpoint to get the current logged in user'
  /*  #swagger.responses[200] = {
          description: 'User successfully logged in',
          schema: { $ref: "#/definitions/User"}
      }
      #swagger.responses[401] = {
          description: 'User not logged in',
          schema: { error: "Not logged in" }
      }
    */
  if (!req.isAuthenticated()) {
    // not logged in
    res.status(401).json({error: "Not logged in"});
    return;
  }
  // logged in, req.user contains the authenticated user
  res.json(req.user);
});

// DELETE /sessions/current
// logout
router.delete("/me", isLoggedIn, (req, res) => {
  // #swagger.tags = ['User']
  // #swagger.description = 'Endpoint to logout the current logged in user'
  /*  #swagger.responses[200] = {
          description: 'User successfully logged out',
      }
      #swagger.responses[401] = {
          description: 'User not logged in',
          schema: { error: "Not authenticated" }
      }
  */
  req.logout(() => {
    res.end();
  });
});

module.exports = router;
