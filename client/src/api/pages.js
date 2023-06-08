import dayjs from "dayjs";
import {URL} from './index.js'


export const getPages = () => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/pages`, {
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
}

export const getPage = (id) => {
    console.log("getPage of id: ", id)
    return new Promise((resolve, reject) => {
        fetch(`${URL}/pages/${id}`, {
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
}

export const updatePageMetadata = (id, page) => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/pages/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(page),
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
}

export const updatePageBlocks = (id, blocks) => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/pages/${id}/blocks`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(blocks),
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
}




export default {
    getPages,
    getPage,
    updatePageMetadata,
    updatePageBlocks,
}
