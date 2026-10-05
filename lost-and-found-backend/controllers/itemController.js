const Item = require("../models/Item");
const Claim = require("../models/Claim");

// @route  GET /api/items?q=&type=&category=
// @access Public
exports.getItems = async (req, res) => {
  try {
    const { q, type, category } = req.query;
    const filter = {};

    if (type && type !== "all") {
      filter.type = type;
    }
    if (category && category !== "all") {
      filter.category = category;
    }
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
      ];
    }

    const items = await Item.find(filter)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(formatItems(items));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch items", error: error.message });
  }
};

// @route  GET /api/items/mine
// @access Private
exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user._id })
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(formatItems(items));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your items", error: error.message });
  }
};

// @route  GET /api/items/:id
// @access Public
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("postedBy", "name email");
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(formatItem(item));
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(500).json({ message: "Failed to fetch item", error: error.message });
  }
};

// @route  POST /api/items
// @access Private
exports.createItem = async (req, res) => {
  try {
    const { type, title, category, description, location, date } = req.body;

    if (!type || !title || !category || !description || !location || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // If a file was uploaded via multer, build a full URL to it.
    // Otherwise fall back to an imageUrl passed in the body (e.g. external URL).
    let image = req.body.imageUrl || "";
    if (req.file) {
      image = req.file.path;
    }

    const item = await Item.create({
      type,
      title,
      category,
      description,
      location,
      date,
      image,
      postedBy: req.user._id,
    });

    const populated = await item.populate("postedBy", "name email");
    res.status(201).json(formatItem(populated));
  } catch (error) {
    res.status(500).json({ message: "Failed to create item", error: error.message });
  }
};

// @route  PATCH /api/items/:id/status
// @access Private (only the item's owner)
exports.updateItemStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["open", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'open' or 'resolved'" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own posts" });
    }

    item.status = status;
    await item.save();

    const populated = await item.populate("postedBy", "name email");
    res.status(200).json(formatItem(populated));
  } catch (error) {
    res.status(500).json({ message: "Failed to update item", error: error.message });
  }
};

// @route  DELETE /api/items/:id
// @access Private (only the item's owner)
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await item.deleteOne();
    res.status(200).json({ success: true, message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete item", error: error.message });
  }
};

// @route  POST /api/items/:id/claim
// @access Private
exports.submitClaim = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: "A message is required" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const claim = await Claim.create({
      item: item._id,
      sender: req.user._id,
      message: message.trim(),
    });

    res.status(201).json({
      id: claim._id,
      itemId: claim.item,
      senderName: req.user.name,
      senderEmail: req.user.email,
      message: claim.message,
      createdAt: claim.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit claim", error: error.message });
  }
};

// @route  GET /api/items/:id/claims
// @access Private (only the item's owner should see claims on their post)
exports.getClaimsForItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only view claims on your own posts" });
    }

    const claims = await Claim.find({ item: item._id })
      .populate("sender", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(
      claims.map((c) => ({
        id: c._id,
        senderName: c.sender.name,
        senderEmail: c.sender.email,
        message: c.message,
        createdAt: c.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch claims", error: error.message });
  }
};

// --- helpers to shape MongoDB documents into the flat shape the frontend expects ---

function formatItem(item) {
  return {
    id: item._id,
    type: item.type,
    title: item.title,
    category: item.category,
    description: item.description,
    location: item.location,
    date: item.date,
    image: item.image,
    postedBy: {
      name: item.postedBy?.name || "Unknown",
      contact: item.postedBy?.email || "",
    },
    status: item.status,
    createdAt: item.createdAt,
  };
}

function formatItems(items) {
  return items.map(formatItem);
}
