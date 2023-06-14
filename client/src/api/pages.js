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
                    return;
                });
            }
        })
        .catch((err) => {
            reject(err);
        });
    });
}

export const updatePage = (id, page) => {
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


export const createPage = (page) => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/pages`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(page)
        })
        .then((res) => {
            res.json().then((page) => {
                resolve(page);
                return
            }).catch((err) => {
                reject(err)
                return;
            })
        })
        .catch((err) => {
            reject(err);
            return;
        })
    })
}

export const deletePage = (id) => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/pages/${id}`, {
            method: "DELETE",
            credentials: "include",
        })
        .then((res) => {
            if (res.status === 200) {
                    resolve();
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
    updatePage,
    createPage,
    deletePage
}
