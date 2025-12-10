const express = require("express");
const router = express.Router();
const multer = require("multer");
const ipfsService = require("../services/ipfsService");

/**
 * Route d'upload d'images vers IPFS
 * @route POST /api/upload/image
 */

// Configuration multer pour stocker en mémoire
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter uniquement les images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

/**
 * Upload une image vers IPFS
 * @route POST /api/upload/image
 * @body file - Image file (multipart/form-data)
 * @returns { success, ipfsHash, url }
 */
router.post("/image", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Bad Request",
        message: "No file uploaded",
      });
    }

    const result = await ipfsService.uploadImage(
      req.file.buffer,
      req.file.originalname
    );

    return res.status(200).json({
      success: true,
      ipfsHash: result.ipfsHash,
      url: result.url,
    });
  } catch (error) {
    console.error("Error uploading image:", error);

    // Si Pinata n'est pas configuré, retourner un hash mock en dev
    if (error.message.includes("Pinata not configured") && process.env.NODE_ENV === "development") {
      const crypto = require("crypto");
      const hash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");
      const mockHash = "Qm" + hash.substring(0, 44);

      return res.status(200).json({
        success: true,
        ipfsHash: mockHash,
        url: `https://ipfs.io/ipfs/${mockHash}`,
        mock: true,
      });
    }

    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to upload image",
      details: error.message,
    });
  }
});

module.exports = router;
