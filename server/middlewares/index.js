const authMiddleware = require('./auth');
const {check, checkSchema} = require('express-validator');

module.exports = {
    ...authMiddleware,
    check
};