const router = require("express").Router();
const pagesDao = require("../db/pages-dao");
const dayjs = require("dayjs");
const { isLoggedIn, isRole } = require("../middlewares");

router.get("/", function (req, res) {
  const filterName = req.query.filter || "all";
  const filter = pagesDao.filters[filterName] || pagesDao.filters.all;

  pagesDao
    .getPagesHead(filter)
    .then((pages) => {
      res.json(pages);
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({ error: "Error retrieving pages from database", details: err });
    });
});
/**
 * Create a new page
 */
router.post("/", isRole(["editor", "admin"]), function (req, res) {
  const userId = req.user.id;
  const page = req.body;
  if (req.user.role === "editor") {
    page.author_id = userId;
  }
  pagesDao
    .addPage(page)
    .then((page) => {
      res.json(page);
    })
    .catch((err) => {
      console.err(err);
      res
        .status(500)
        .json({ error: "Error adding page to database", details: err });
    });
});

router.get("/:id", function (req, res) {
  const id = req.params.id;
  pagesDao
    .getPageById(id)
    .then((page) => {
      res.json(page);
    })
    .catch((err) => {
      console.err(err);
      res
        .status(500)
        .json({ error: "Error retrieving page from database", details: err });
    });
});

router.put("/:id", isRole(["editor", "admin"]), async (req, res) => {
    const id = req.params.id;
    const page = req.body;
    const oldPage = await pagesDao.getPageById(id);
    if (req.user.role === "editor" && oldPage.author_id !== req.user.id) {
        res.status(403).json({ error: "You can't edit this page" });
        return;
    }
    pagesDao.updatePage(id, page).then((page) => {
        res.json(page);
    }).catch((err) => {
        console.err(err);
        res.status(500).json({ error: "Error updating page", details: err });
    });
});

router.delete("/:id", isRole(["editor", "admin"]), async (req, res) => {
    const id = req.params.id;
    const page = await pagesDao.getPageById(id);
    if (req.user.role === "editor" && page.author_id !== req.user.id) {
        res.status(403).json({ error: "You can't delete this page" });
        return;
    }
    pagesDao.deletePage(id).then(() => {
        res.status(200).end();
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ error: "Error deleting page", details: err });
    });
});

router.put("/:id/block/:blockId", isRole(["editor", "admin"]), async (req, res) => {
    const id = req.params.id;
    const blockId = req.params.blockId;
    const block = req.body;
    const page = await pagesDao.getPageById(id);
    if (req.user.role === "editor" && page.author_id !== req.user.id) {
        res.status(403).json({ error: "You can't edit this block" });
        return;
    }
    pagesDao.updateBlock(id, blockId, block).then((block) => {
        res.json(block);
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ error: "Error updating block", details: err });
    });
});

router.delete("/:id/block/:blockId", isRole(["editor", "admin"]), async (req, res) => {
    const id = req.params.id;
    const blockId = req.params.blockId;
    const page = await pagesDao.getPageById(id);
    if (req.user.role === "editor" && page.author_id !== req.user.id) {
        res.status(403).json({ error: "You can't delete this block" });
        return;
    }
    pagesDao.deleteBlock(id, blockId).then(() => {
        res.status(200).end();
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ error: "Error deleting block", details: err });
    });
});

router.post("/:id/block", isRole(["editor", "admin"]), async (req, res) => {
    const id = req.params.id;
    const block = req.body;
    const page = await pagesDao.getPageById(id);
    if (req.user.role === "editor" && page.author_id !== req.user.id) {
        res.status(403).json({ error: "You can't add a block to this page" });
        return;
    }
    pagesDao.appendBlock(id, block).then((block) => {
        res.json(block);
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ error: "Error adding block", details: err });
    });
});

router.put("/:id/blocks", isRole(["editor", "admin"]), async (req, res) => {
    const id = req.params.id;
    const blocks = req.body;
    const page = await pagesDao.getPageById(id);
    if (req.user.role === "editor" && page.author_id !== req.user.id) {
        res.status(403).json({ error: "You can't edit this page" });
        return;
    }
    pagesDao.updateBlocks(id, blocks).then((blocks) => {
        res.json(blocks);
    }).catch((err) => {
        console.log(err);
        res.status(500).json({ error: "Error updating blocks", details: err });
    });
});




module.exports = router;
