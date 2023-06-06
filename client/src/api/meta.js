"use strict";

import { URL } from "./index";

export const getSiteName = () => {
  return new Promise((resolve, reject) => {
    const url = `${URL}/meta/name`;
    fetch(url, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        res
          .json()
          .then((data) => resolve(data.name))
          .catch((err) => reject(err));
      })
      .catch((err) => reject(err));
  });
};

export const setSiteName = (name) => {
  return new Promise((resolve, reject) => {
    const url = `${URL}/meta/name`;
    fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    })
      .then((res) => {
        if (res.status === 200) {
          resolve();
        } else {
          res
            .json()
            .then((data) => reject(data))
            .catch((err) => reject(err));
        }
      })
      .catch((err) => reject(err));
  });
};

export default {
    getSiteName,
    setSiteName
}
