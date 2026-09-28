const express = require("express");
const router = express.Router();
const {
  getItems,
  getMyItems,
  getItemById,
  createItem,
  updateItemStatus,
  deleteItem,
  submitClaim,
  getClaimsForItem,
} = require("../controllers/itemController");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public
router.get("/", getItems);

// Private — specific routes before "/:id" so they aren't swallowed by it
router.get("/mine", protect, getMyItems);
router.post("/", protect, upload.single("image"), createItem);

router.get("/:id", getItemById);
router.patch("/:id/status", protect, updateItemStatus);
router.delete("/:id", protect, deleteItem);

router.post("/:id/claim", protect, submitClaim);
router.get("/:id/claims", protect, getClaimsForItem);

module.exports = router;
