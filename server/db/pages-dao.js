"use strict";
const db = require("./db");
const dayjs = require("dayjs");

const { prettifyUnexpectedError } = require("./utils");

const pageBlocksCount = (blocks) => {
  blocks = blocks ?? [];
  return {
    header: blocks.filter((b) => b.type === "header").length,
    paragraph: blocks.filter((b) => b.type === "paragraph").length,
    image: blocks.filter((b) => b.type === "image").length,
  };
};

/** Error Typedef
 * @typedef {Object} Error
 * @property {string} error
 */

/** PageHead Typedef
 * @typedef {Object} PageHead
 * @property {number} id
 * @property {string} title
 * @property {string} author
 * @property {string} published_at
 * @property {string} created_at
 * @property {string} author_name
 */

/** Block Typedef
 * @typedef {Object} Block
 * @property {number} id
 * @property {number} page_id
 * @property {string} type
 * @property {string} content
 */

/** Page Typedef
 * @typedef {Object} Page
 * @property {number} id
 * @property {string} title
 * @property {string} author
 * @property {string} published_at
 * @property {string} created_at
 * @property {Block[]} blocks
 */

/**
 * Get Full Page by id
 *
 * @param {number} id Page id
 * @returns {Promise<Page|Error>} Promise containing the page
 */
const getPageById = (id) => {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT p.*, u.name as author_name FROM pages p, users u WHERE p.id = ? AND u.id = p.author";
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(prettifyUnexpectedError(err));
        return;
      }
      if (row === undefined) {
        resolve({
          error: "Page not found.",
          details: `Page does not exist.`,
          code: 404,
        });
      } else {
        const page = {
          id: row.id,
          title: row.title,
          author: row.author,
          published_at: row.published_at,
          created_at: row.created_at,
          author_name: row.author_name,
        };
        getBlocks(page.id)
          .then((blocks) => {
            page.blocks = blocks;
            resolve(page);
          })
          .catch((err) => {
            reject(err);
            return;
          });
      }
    });
  });
};

/**
 *
 * @param {boolean} publishedOnly
 * @returns {Promise<PageHead[]|Error>}
 */
const getPagesHead = (publishedOnly) => {
  return new Promise((resolve, reject) => {
    // Could filter publishedOnly via SQL but i don't want to play with dates on sqlite
    const sql =
      "SELECT p.*, a.name as author_name FROM pages p, users a WHERE a.id = p.author ORDER BY p.published_at";
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(prettifyUnexpectedError(err));
        return;
      }
      const pages = rows.map((row) => ({
        id: row.id,
        title: row.title,
        author: row.author,
        published_at: row.published_at,
        created_at: row.created_at,
        author_name: row.author_name,
      }));
      if (publishedOnly) {
        resolve(
          pages.filter(
            (p) =>
              p.published_at !== null && dayjs(p.published_at).isBefore(dayjs())
          )
        );
      } else {
        resolve(pages);
      }
    });
  });
};

/**
 *
 * @param {PageHead} page
 * @param {Block[]} blocks
 * @returns {Promise<Page|Error>}
 */
const createPage = (page, blocks) => {
  return new Promise((resolve, reject) => {
    // These checks could've been done via express-validator.check but i wanted to keep the db layer as independent as possible
    // also because i wrote this first so i don't see the point in rewriting it
    if (page.author === undefined || page.author === null) {
      reject({
        error: "Author is required.",
        code: 400,
      });
      return;
    }
    if (
      page.published_at !== null &&
      page.published_at !== undefined &&
      !dayjs(page.published_at).isValid()
    ) {
      reject({
        error: "Not a valid publish date.",
        details: "Must be a valid Date or a Draft",
        code: 400,
      });
      return;
    }
    if (!Array.isArray(blocks)) {
      reject({
        error: "Invalid Request",
        details: "blocks must be an array",
        extra: blocks,
        code: 400,
      });
      return;
    }
    if (
      !(
        blocks.some((b) => b.type === "header") &&
        blocks.some((b) => b.type !== "header")
      )
    ) {
      reject({
        error: "Invalid Request",
        details:
          "blocks do not meat the constraint: at least one header and something else.",
        extra: blocks,
        code: 400,
      });
      return;
    }
    page.published_at = page.published_at
      ? dayjs(page.published_at).startOf("day").toISOString()
      : null;
    const sql =
      "INSERT INTO pages(title, published_at, author, created_at) VALUES(?,?,?,?)";

    db.run(
      sql,
      [page.title, page.published_at, page.author, dayjs().toISOString()],
      function (err) {
        if (err) {
          reject(prettifyUnexpectedError(err));
          return;
        }
        blocks = blocks
          .sort((a, b) => a.order - b.order)
          .map((b) => ({ ...b, page_id: this.lastID }));
        const blocks_insert_promises = blocks.map(
          (block, index) =>
            appendBlock(this.lastID, { ...block, order: index + 1 }) // to make sure there are no gaps in the order
        );
        Promise.all(blocks_insert_promises)
          .then((blocks) => {
            resolve({ ...page, blocks, id: this.lastID });
          })
          .catch((err) => {
            reject(err);
            return;
          });
      }
    );
  });
};

/**
 * Deletes a page and all its blocks
 * @param {number} id
 * @returns {Promise<null|Error>}
 */
const deletePage = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM pages WHERE id = ?";
    db.run(sql, [id], function (err) {
      if (err) {
        reject(prettifyUnexpectedError(err));
        return;
      }
      deleteAllBlocksOfPage(id)
        .then(() => {
          resolve(null);
        })
        .catch((err) => {
          reject(err);
          return;
        });
    });
  });
};

/**
 * Updates a page
 * @param {Page|PageHead} page (returned if successful)
 * @returns {Promise<Page|Error>}
 */
const updatePage = (page) => {
  return new Promise((resolve, reject) => {
    if (
      page.published_at !== null &&
      page.published_at !== undefined &&
      !dayjs(page.published_at).isValid()
    ) {
      reject({
        error: "Not a valid publish date.",
        details: "Must be a valid Date or a Draft",
        code: 400,
      });
    }
    page.published_at = page.published_at
      ? dayjs(page.published_at).startOf("day").toISOString()
      : null;
    const sql =
      "UPDATE pages SET title = ?, published_at = ?, author = ? WHERE id = ?";
    db.run(
      sql,
      [page.title, page.published_at, page.author, page.id],
      function (err) {
        if (err) reject(prettifyUnexpectedError(err));
        else resolve(page);
      }
    );
  });
};

/**
 * Get all blocks of a page ordered by 'order'
 * @param {number} pageId
 * @returns {Promise<Block[]|Error>}
 */
const getBlocks = (pageId) => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM blocks WHERE page_id = ? ORDER BY `order` ASC";
    db.all(sql, [pageId], (err, rows) => {
      if (err) {
        reject(prettifyUnexpectedError(err));
        return;
      }
      const blocks = rows.map((row) => ({
        id: row.id,
        page_id: row.page_id,
        type: row.type,
        content: row.content,
        order: row.order,
      }));
      resolve(blocks);
    });
  });
};

/**
 * Appends a block to a page
 * @param {number} pageId
 * @param {Block} block
 * @returns {Promise<Block|Error>}
 */
const appendBlock = (pageId, block) => {
  // TODO: handle order reupdates?
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO blocks(page_id, type, content, `order`) VALUES(?,?,?,?)";
    db.run(
      sql,
      [pageId, block.type, block.content, block.order],
      function (err) {
        if (err) reject(prettifyUnexpectedError(err));
        else resolve({ ...block, id: this.lastID, page_id: pageId });
      }
    );
  });
};

const deleteAllBlocksOfPage = (pageId) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM blocks WHERE page_id = ?";
    db.run(sql, [pageId], function (err) {
      if (err) reject(prettifyUnexpectedError(err));
      else resolve(null);
    });
  });
};

/**
 * Deletes a block without checking if the page would still be valid, use updateBlocks instead
 * @param {Block} block
 * @returns {Promise<null|Error>}
 */
const deleteBlock = (pageId, blockId) => {
  return new Promise((resolve, reject) => {
    getPageById(pageId).then((page) => {
      const block = page.blocks.find((b) => b.id === blockId);
      if (block === undefined) {
        reject({
          error: `Trying to delete a block not found in current page.`,
          code: 400,
        });
        return;
      }

      const sql = "DELETE FROM blocks WHERE id = ?";
      db.run(sql, [block.id], function (err) {
        if (err) reject(err);
        else resolve(null);
      });
    });
  });
};

/**
 * Updates a block without checking if the page would still be valid, use updateBlocks instead
 * @param {Block} block
 * @returns {Promise<Block|Error>}
 */
const updateBlock = (pageId, blockId, block) => {
  return new Promise((resolve, reject) => {
    getPageById(pageId)
      .then((page) => {
        const oldBlock = page.blocks.find((b) => b.id === blockId);
        if (oldBlock === undefined) {
          reject({
            error: "Block not found.",
            details: "Trying to update a block not in page",
            code: 400,
          });
          return;
        }
        // If are equals skip the update
        if (
          oldBlock.type === block.type &&
          oldBlock.content === block.content &&
          oldBlock.order === block.order
        ) {
          resolve(block);
          return;
        }
        const sql =
          "UPDATE blocks SET type = ?, content = ?, `order` = ? WHERE id = ?";
        db.run(
          sql,
          [block.type, block.content, block.order, block.id],
          function (err) {
            if (err) reject(prettifyUnexpectedError(err));
            else resolve(block);
          }
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * Updates all the blocks of a page only if the page would still be valid
 * @param {Block[]} newBlocks
 * @returns {Promise<Block[]|Error>}
 */
const updateBlocks = (page_id, newBlocks) => {
  return new Promise((resolve, reject) => {
    if (
      !Array.isArray(newBlocks) ||
      newBlocks.length === 0 ||
      newBlocks.some((b) => b.page_id !== page_id)
    ) {
      reject({
        error: "Invalid Request",
        details:
          "blocks not valid. either it is an empty array or the page_id's don't match throughout the array",
        code: 400,
      });
      return;
    }
    // Check if page is still valid
    const bc = pageBlocksCount(newBlocks);
    if (bc.header === 0 || bc.paragraph + bc.image === 0) {
      reject({
        error: "Unable to update page",
        details:
          "Page must contain at least one header and one paragraph or image.",
        code: 400,
      });
      return;
    }
    getPageById(page_id)
      .then((page) => {
        if (page.error) {
          reject(page); // May be useless since an error should not arrive here
          return;
        }
        // Delete missing blocks
        const deletePromises = page.blocks
          .filter((b) => !newBlocks.some((nb) => nb.id === b.id))
          .map((b) => deleteBlock(page_id, b.id));

        // Add new blocks
        const addPromises = newBlocks
          .filter((nb) => !page.blocks.some((b) => b.id === nb.id))
          .map((nb) => appendBlock(page_id, nb));

        const editPromises = newBlocks
          .filter((nb) => page.blocks.some((b) => b.id === nb.id))
          .map((nb) => updateBlock(page_id, nb.id, nb));

        Promise.all([...deletePromises, ...addPromises, ...editPromises])
          .then((blocks) => {
            resolve(blocks.filter((b) => b !== null));
          })
          .catch((err) => {
            reject(err);
            return;
          });
      })
      .catch((err) => {
        reject(err);
        return;
      });
  });
};

module.exports = {
  getPagesHead,
  getPageById,
  createPage,
  appendBlock,
  deletePage,
  updatePage,
  updateBlocks,
};
