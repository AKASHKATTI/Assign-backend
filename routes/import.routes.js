const express = require("express");
const multer = require("multer");
const { previewController, processController } = require("../controllers/import.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/preview", upload.single("file"), previewController);
router.post("/process", upload.single("file"), processController);

module.exports = router;