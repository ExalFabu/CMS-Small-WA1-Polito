"use strict";
/* Data Access Object (DAO) module for accessing users */

const db = require("./db");
const crypto = require("crypto");

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE id = ?";
    db.get(sql, [id], (err, row) => {
      if (err) reject(err);
      else if (row === undefined) resolve({ error: "User not found." });
      else {
        // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
        const user = {
          id: row.id,
          username: row.email,
          name: row.name,
          role: row.role,
        };
        resolve(user);
      }
    });
  });
};

exports.getUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.get(sql, [email], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false);
      } else {
        const user = {
          id: row.id,
          username: row.email,
          name: row.name,
          role: row.role,
        };

        const salt = row.salt;
        crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
          if (err) reject(err);

          const passwordHex = Buffer.from(row.password, "hex");

          if (!crypto.timingSafeEqual(passwordHex, hashedPassword))
            resolve(false);
          else resolve(user);
        });
      }
    });
  });
};

exports.getUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, name FROM users where role = "editor"';
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else {
        const users = rows.map((row) => ({ id: row.id, name: row.name }));
        resolve(users);
      }
    });
  });
};
