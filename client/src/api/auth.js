import {URL} from './index.js'

export const login = (username, password) => {
  return new Promise((resolve, reject) => {
    fetch(`${URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    })
      .then((res) => {
        if (res.status === 200) {
          res.json().then((data) => {
            resolve(data);
          });
        } else {
          res.json().then((data) => {
            reject(data);
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const checkAuth = () => {
  return new Promise((resolve, reject) => {
    fetch(`${URL}/auth/me`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 200) {
          res.json().then((data) => {
            resolve(data);
          });
        } else {
          res.json().then((data) => {
            reject(data);
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const logout = () => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/auth/me`, {
            method: "DELETE",
            credentials: "include",
        })
        .then((res) => {
            if (res.status === 200) {
                resolve({})
            } else {
                res.json().then((data) => {
                    reject(data);
                });
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
};

export default {
  login,
  checkAuth,
  logout
};
