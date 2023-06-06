"use strict";

const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middlewares");

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
  setSiteName(name)
    .then(() => {
      res.status(200).end();
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

module.exports = router;
