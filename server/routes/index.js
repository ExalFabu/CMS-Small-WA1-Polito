'use strict';

const authRouter = require('./auth');
const router = require("express").Router();

router.use('/auth', authRouter);

module.exports = router