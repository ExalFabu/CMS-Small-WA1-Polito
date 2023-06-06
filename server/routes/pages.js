const router = require("express").Router();
const pagesDao = require("../db/pages-dao");
const dayjs = require("dayjs");
const { isLoggedIn, isRole, isEditor, check } = require("../middlewares");
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
    #swagger.parameters['filter'] = {
        in: 'query',
        description: 'Filter to apply to the pages list',
        schema: { '@enum': ['all', 'published', 'drafts', 'scheduled'] }
    },
    */
  /*
   #swagger.responses[200] = {
        description: 'List of PageHead objects',
        type: 'array',
        items: { $ref: '#/definitions/PageHead' },
        collectionFormat: 'multi'
    }
   */
  const filterName = req.query.filter ?? "all";

  pagesDao
    .getPagesHead(filterName)
    .then((pages) => {
      res.json(pages);
    })
    .catch((err) => {
      handleError(err, res, "Error retrieving pages from database");
    });
});
/**
 * Create a new page
 */
router.post(
  "/",
  /*isEditor,*/ function (req, res) {
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
      const userId = req.user.id;
      if (req.user.role === "editor") {
        page.author = userId;
      }
    }
    pagesDao
      .createPage(page, page.blocks)
      .then((page) => {
        res.json(page);
      })
      .catch((err) => {
        handleError(err, res, "Error adding page to database");
      });
  }
);

router.get("/:id", function (req, res) {
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
  const id = req.params.id;
  pagesDao
    .getPageById(id)
    .then((page) => {
      res.json(page);
    })
    .catch((err) => {
      handleError(err, res, "Error retrieving page from database");
    });
});

router.put("/:id", isRole(["editor", "admin"]), async (req, res) => {
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
  const id = req.params.id;
  const page = req.body;
  const oldPage = await pagesDao.getPageById(id);
  if (!BYPASS_AUTH) {
    if (req.user.role === "editor" && oldPage.author !== req.user.id) {
      res.status(403).json({ error: "You can't edit this page" });
      return;
    }
  }
  pagesDao
    .updatePage(page)
    .then((page) => {
      res.json(page);
    })
    .catch((err) => {
      handleError(err, res, "Error updating page");
    });
});

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

router.put(
  "/:id/block/:blockId",
  isRole(["editor", "admin"]),
  async (req, res) => {
    // #swagger.tags = ['Pages']
    // #swagger.description = 'Endpoint to update a block by id'
    const id = req.params.id;
    const blockId = req.params.blockId;
    const block = req.body;
    const page = await pagesDao.getPageById(id);
    if (!BYPASS_AUTH) {
      if (req.user.role === "editor" && page.author !== req.user.id) {
        res.status(403).json({ error: "You can't edit this block" });
        return;
      }
    }
    pagesDao
      .updateBlock(id, blockId, block)
      .then((block) => {
        res.json(block);
      })
      .catch((err) => {
        handleError(err, res, "Error updating block");
      });
  }
);

router.delete(
  "/:id/block/:blockId",
  isRole(["editor", "admin"]),
  [check("id").isInt(), check("blockId").isInt()],
  async (req, res) => {
    // #swagger.tags = ['Pages']
    // #swagger.description = 'Endpoint to delete a block by id'
    const id = parseInt(req.params.id);
    const blockId = parseInt(req.params.blockId);
    const page = await pagesDao.getPageById(id);
    if (!BYPASS_AUTH) {
      if (req.user.role === "editor" && page.author !== req.user.id) {
        res.status(403).json({ error: "You can't delete this block" });
        return;
      }
    }
    pagesDao
      .deleteBlock(id, blockId)
      .then(() => {
        res.status(200).end();
      })
      .catch((err) => {
        handleError(err, res, "Error deleting block");
      });
  }
);

router.post(
  "/:id/block",
  isRole(["editor", "admin"]),
  [check("id").isInt()],
  async (req, res) => {
    // #swagger.tags = ['Pages']
    // #swagger.description = 'Endpoint to add a block to a page'
    /*
    #swagger.parameters['id'] = {
        in: 'path',
        description: 'Page id',
        required: true,
        type: 'integer'
    },
    #swagger.parameters['block'] = {
        in: 'body',
        description: 'Block object to add',
        required: true,
        schema: { $ref: '#/definitions/Block' }
    },
    */

    const id = req.params.id;
    const block = req.body;
    const page = await pagesDao.getPageById(id);
    if (!BYPASS_AUTH) {
      if (req.user.role === "editor" && page.author !== req.user.id) {
        res.status(403).json({ error: "You can't add a block to this page" });
        return;
      }
    }
    pagesDao
      .appendBlock(id, block)
      .then((block) => {
        res.json(block);
      })
      .catch((err) => {
        console.log(err);
        const code = err.code ?? 500;
        if (err.code) {
          delete err.code;
        }
        res.status(code).json({ error: "Error adding block", details: err });
      });
  }
);

router.put("/:id/blocks", isRole(["editor", "admin"]), async (req, res) => {
  // #swagger.tags = ['Pages']
  // #swagger.description = 'Endpoint to update all blocks of a page, removing the previous ones'
  const id = req.params.id;
  const blocks = req.body;
  const page = await pagesDao.getPageById(id);
  if (!BYPASS_AUTH) {
    if (req.user.role === "editor" && page.author !== req.user.id) {
      res.status(403).json({ error: "You can't edit this page" });
      return;
    }
  }
  pagesDao
    .updateBlocks(id, blocks)
    .then((blocks) => {
      res.json(blocks);
    })
    .catch((err) => {
      handleError(err, res, "Error updating blocks");
    });
});

module.exports = router;
