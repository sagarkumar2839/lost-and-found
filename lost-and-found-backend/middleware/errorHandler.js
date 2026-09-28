// Catches Multer errors and any other errors passed via next(err)
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "MulterError") {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  if (err.message && err.message.includes("Only image files")) {
    return res.status(400).json({ message: err.message });
  }

  res.status(err.status || 500).json({
    message: err.message || "Something went wrong on the server",
  });
};

module.exports = errorHandler;
