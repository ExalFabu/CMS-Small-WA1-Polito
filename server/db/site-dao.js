'use strict';

const db = require('./db');
const { prettifyUnexpectedError } = require('./utils')
exports.getSiteName = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT title FROM site where id = 1';
        db.get(sql, (err, row) => {
        if (err) 
            reject(prettifyUnexpectedError(err));
        else if (row === undefined)
            reject({error: 'Site Name not found.', details: "This should never occurr", code: 500}); // This should never occurr
        else {
            const name = row.title
            resolve(name);
        }
        });
    });
}

exports.setSiteName = (title) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE site SET title = ? WHERE id = 1';
        db.run(sql, [title], (err) => {
        if (err) 
            reject(prettifyUnexpectedError(err));
        else {
            resolve();
        }
        });
    });
}