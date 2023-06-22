"use strict";

const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middlewares");

const { getUsers } = require("../db/user-dao");
const { getSiteName, setSiteName } = require("../db/site-dao");

router.get("/name", function (req, res) {
  // #swagger.tags = ['Site']
  // #swagger.description = 'Endpoint to get the site name'
  /*  #swagger.responses[200] = {
                description: 'Site name successfully retrieved',
                schema: { name: 'CMSmall' }
            }
        */
  getSiteName()
    .then((name) => {
      res.json({ name });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.put("/name", isAdmin, function (req, res) {
  // #swagger.tags = ['Site']
  // #swagger.description = 'Endpoint to update the site name'
  /*  #swagger.parameters['Site'] = {
                in: 'body',
                description: 'Site name to update', 
                schema: {
                    $name: 'CMSmall'
                }
    }
        #swagger.responses[200] = {
            description: 'Site name successfully updated',
        }
        #swagger.responses[400] = {
            description: 'Invalid name',
            schema: { $ref: "#/definitions/Error" }
        }
        #swagger.responses[401] = {
            description: 'Not authorized',
            schema: { $ref: "#/definitions/Error" }
        }
        #swagger.responses[500] = {
            description: 'Error while updating site name',
            schema: { $ref: "#/definitions/Error" }
        }
    */
  const { name } = req.body;
  if(!name) return res.status(400).json({error: "Invalid name"});
  setSiteName(name)
    .then(() => {
      res.status(200).end();
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.get("/editors", isAdmin, function (req, res) {
  // #swagger.tags = ['Site']
  // #swagger.description = 'Endpoint to get all editors'
  /*  #swagger.responses[200] = {
                    description: 'Users successfully retrieved',
                    schema: { 
                        $id: 1,
                        $name: 'John Doe',
                     }
                }
            */
  getUsers()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get("/images", function (req, res) {
  // #swagger.tags = ['Site']
  // #swagger.description = 'Endpoint to get all images'
  /*  #swagger.responses[200] = {
                    description: 'Images successfully retrieved',
                    schema: { 
                        $name: 'image.png',
                        $path: 'images/image.png'
                     }
                }
            */
  const fs = require("fs");
  const path = require("path");
  const dir = path.join(__dirname, "../public/images");
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.log(err);
      res.status(500).json(err);
    } else {
      const images = files.map((file) => {
        return {
          name: file,
          path: `images/${file}`,
        };
      });
      res.json(images);
    }
  });
})

module.exports = router;
