'use strict';

const authRouter = require('./auth');
const router = require("express").Router();
const pagesRouter = require('./pages');
const metaRouter = require('./meta');

router.use('/meta', metaRouter);
router.use('/auth', authRouter);
router.use('/pages', pagesRouter);
module.exports = router