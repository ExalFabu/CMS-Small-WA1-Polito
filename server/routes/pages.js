const router = require("express").Router();
const pagesDao = require("../db/pages-dao");
const dayjs = require("dayjs");
const { isRole, check } = require("../middlewares");
const BYPASS_AUTH = process.env.BYPASS_AUTH === "true";

const handleError = (err, res, message) => {
  console.log(err);
  const code = err.code ?? 500;
  if (err.code) {
    delete err.code;
  }
  res.status(code).json({ error: message, details: err });
};

router.get("/", function (req, res) {
  //
  // #swagger.tags = ['Pages']
  // #swagger.description = 'Endpoint to get all pages'
  /*
   #swagger.responses[200] = {
        description: 'List of PageHead objects',
        type: 'array',
        items: { $ref: '#/definitions/PageHead' },
        collectionFormat: 'multi'
    }
   */

  let publishedOnly = !req.user || req.user.role === "user";

  pagesDao
    .getPagesHead(publishedOnly)
    .then((pages) => {
      // Misunderstood requirement: editors can see drafts of other editors
      // if (req.user && req.user.role === "editor") {
      //   const isPublished = (p) => dayjs(p.published_at).isBefore(dayjs());
      //   pages = pages.filter((p) => isPublished(p) || p.author === req.user.id);
      // }
      res.json(pages);
    })
    .catch((err) => {
      handleError(err, res, "Error retrieving pages from database");
    });
});
/**
 * Create a new page
 */
router.post("/", isRole(["editor", "admin"]), function (req, res) {
  // #swagger.tags = ['Pages']
  // #swagger.description = 'Endpoint to create a new page'
  /*
    #swagger.parameters['page'] = {
        in: 'body',
        description: 'Page object to add',
        required: true,
        schema: { $ref: '#/definitions/Page' }
    },
    #swagger.responses[200] = {
        description: 'Page object',
        schema: { $ref: '#/definitions/Page' }
    }
    #swagger.responses[403] = {
        description: 'You are not allowed to create a page',
        schema: { $ref: '#/definitions/Error' }
    }
    #swagger.responses[500] = {
        description: 'Error adding page to database',
        schema: { $ref: '#/definitions/Error' }
    }
    */
  const page = req.body;
  if (!BYPASS_AUTH) {
    const userId = parseInt(req.user.id);
    if (req.user.role === "editor" && page.author !== userId) {
      res
        .status(403)
        .json({ error: "You can't create a page for someone else" });
      return;
    }
  }
  pagesDao
    .createPage(page, page.blocks)
    .then((page) => {
      res.json(page);
    })
    .catch((err) => {
      handleError(err, res, "Error while creating a page");
    });
});

router.get("/:id", [check("id").isInt()], async function (req, res) {
  // #swagger.tags = ['Pages']
  // #swagger.description = 'Endpoint to get a page by id'
  /*
    #swagger.parameters['id'] = {
        in: 'path',
        description: 'Page id',
        required: true,
        type: 'integer'
    },
    #swagger.responses[200] = {
        description: 'Page object',
        schema: { $ref: '#/definitions/Page' }
    }
    #swagger.responses[500] = {
        description: 'Error retrieving page from database',
        schema: { $ref: '#/definitions/Error' }
    }
    */
  const id = parseInt(req.params.id);
  try {
    const page = await pagesDao.getPageById(id);
    if (page.error) {
      res.status(page.code ?? 401).json(page);
      return;
    }
    const now = dayjs();
    const isDraft = !page.published_at;
    const isPublished = dayjs(page.published_at).isBefore(now);
    if (req.user || isPublished) {
      res.json(page);
      return;
    } else if (isDraft) {
      res.status(403).json({
        error: "You can't see this page",
        details: "This is still a draft to be published",
      });
      return;
    } else if (!isPublished) {
      res.status(403).json({
        error: "You can't see this page",
        details: "This page is not published yet",
      });
      return;
    }
  } catch (err) {
    return handleError(err, res, "Error retrieving page from database");
  }
});

router.put(
  "/:id",
  isRole(["editor", "admin"]),
  [check("id").isInt()],
  async (req, res) => {
    // #swagger.tags = ['Pages']
    // #swagger.description = 'Endpoint to update a page metadata by id'
    /*
    #swagger.parameters['id'] = {
        in: 'path',
        description: 'Page id',
        required: true,
        type: 'integer'
    },
    #swagger.parameters['page'] = {
        in: 'body',
        description: 'Page object to update',
        required: true,
        schema: { $ref: '#/definitions/PageHead' }
    }
    #swagger.responses[200] = {
        description: 'Page object',
        schema: { $ref: '#/definitions/PageHead' }
    }
    #swagger.responses[403] = {
        description: 'You are not allowed to edit this page',
        schema: { $ref: '#/definitions/Error' }
    }
    #swagger.responses[500] = {
        description: 'Error updating page',
        schema: { $ref: '#/definitions/Error' }
    }
    */
    const id = parseInt(req.params.id);
    const page = req.body;
    try {
      const oldPage = await pagesDao.getPageById(id);
      if (!BYPASS_AUTH) {
        if (req.user.role === "editor" && oldPage.author !== req.user.id) {
          res.status(403).json({ error: "You can't edit this page" });
          return;
        }
      }
    } catch (err) {
      return handleError(err, res, "Error retrieving page from database");
    }
    try {
      const updatedPage = await pagesDao.updatePage(page);
      // If update of metadata went well, update blocks
      const blocks = page.blocks;
      const updatedBlocks = await pagesDao.updateBlocks(id, blocks);
      res.json({ ...updatedPage, blocks: updatedBlocks });
      return;
    } catch (err) {
      return handleError(err, res, "Error updating page");
    }
  }
);

router.delete("/:id", isRole(["editor", "admin"]), async (req, res) => {
  // #swagger.tags = ['Pages']
  // #swagger.description = 'Endpoint to delete a page and all its blocks'
  const id = req.params.id;
  const page = await pagesDao.getPageById(id);
  if (!BYPASS_AUTH) {
    if (req.user.role === "editor" && page.author !== req.user.id) {
      res.status(403).json({ error: "You can't delete this page" });
      return;
    }
  }
  pagesDao
    .deletePage(id)
    .then(() => {
      res.status(200).end();
    })
    .catch((err) => {
      handleError(err, res, "Error deleting page");
    });
});

// router.put(
//   "/:id/blocks",
//   isRole(["editor", "admin"]),
//   [check("id").isInt()],
//   async (req, res) => {
//     // #swagger.tags = ['Pages']
//     // #swagger.description = 'Endpoint to update all blocks of a page, removing the previous ones'
//     const id = parseInt(req.params.id);
//     const blocks = req.body;
//     const page = await pagesDao.getPageById(id);
//     if (!BYPASS_AUTH) {
//       if (req.user.role === "editor" && page.author !== req.user.id) {
//         res.status(403).json({ error: "You can't edit this page" });
//         return;
//       }
//     }
//     pagesDao
//       .updateBlocks(id, blocks)
//       .then((blocks) => {
//         res.json(blocks);
//       })
//       .catch((err) => {
//         handleError(err, res, "Error updating blocks");
//       });
//   }
// );

module.exports = router;
