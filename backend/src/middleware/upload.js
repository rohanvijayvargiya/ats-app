const multer = require("multer");

// Files are kept in memory only long enough to extract text, never
// written to disk — nothing to clean up, nothing to leak.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    const ok = /\.(pdf|docx|txt)$/i.test(file.originalname);
    cb(ok ? null : new Error("Unsupported file type. Use .pdf, .docx or .txt"), ok);
  },
});

module.exports = upload;
