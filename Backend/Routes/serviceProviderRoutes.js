const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ServiceProvider = require("../models/serviceProvider");

// ====================== AUTO CREATE UPLOAD FOLDER ======================
const uploadDir = path.join(__dirname, "../uploads/nic");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ Upload folder created: uploads/nic");
}

// ====================== MULTER CONFIGURATION ======================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// ====================== REGISTER ROUTE ======================
router.post(
  "/register",
  upload.fields([
    { name: "nicFront", maxCount: 1 },
    { name: "nicBack", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        email,
        phoneNumber,
        nicNumber,
        yearsOfExperience,
        serviceArea,
        serviceType,
        description,
      } = req.body;

      if (!name || !email || !phoneNumber || !nicNumber || !yearsOfExperience ||
          !serviceArea || !serviceType) {
        return res.status(400).json({ error: "Please fill all required fields" });
      }

      if (!req.files || !req.files.nicFront || !req.files.nicBack) {
        return res.status(400).json({ error: "Both NIC Front and Back images are required" });
      }

      const existingProvider = await ServiceProvider.findOne({
        $or: [{ email }, { nicNumber }],
      });

      if (existingProvider) {
        return res.status(400).json({
          error: existingProvider.email === email
            ? "Email is already registered"
            : "NIC Number is already registered",
        });
      }

      const newServiceProvider = new ServiceProvider({
        name,
        email,
        phoneNumber,
        nicNumber,
        yearsOfExperience: parseInt(yearsOfExperience),
        serviceArea,
        serviceType,
        description: description || "",
        nicFrontImage: `uploads/nic/${req.files.nicFront[0].filename}`,
        nicBackImage: `uploads/nic/${req.files.nicBack[0].filename}`,
      });

      await newServiceProvider.save();

      res.status(201).json({
        message: "Service provider registered successfully!",
        providerId: newServiceProvider._id,
      });
    } catch (err) {
      console.error("Registration Error:", err);
      res.status(500).json({
        error: "Internal Server Error",
        details: err.message,
      });
    }
  }
);

// ====================== SPECIFIC ROUTES FIRST ======================

// Get service type distribution counts (for dashboard chart)
router.get("/service-type-counts", async (req, res) => {
  try {
    const counts = await ServiceProvider.aggregate([
      {
        $group: {
          _id: "$serviceType",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          serviceType: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);
    res.json(counts);
  } catch (error) {
    console.error("Error fetching service type counts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get daily registrations
router.get("/daily-registrations", async (req, res) => {
  try {
    const registrations = await ServiceProvider.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
    ]);
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all verified service providers
router.get("/verified", async (req, res) => {
  try {
    const verifiedProviders = await ServiceProvider.find({ status: "verified" });
    res.json(verifiedProviders);
  } catch (error) {
    console.error("Error fetching verified providers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all unverified service providers
router.get("/", async (req, res) => {
  try {
    const providers = await ServiceProvider.find({ status: { $ne: "verified" } });
    res.json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ====================== DYNAMIC :id ROUTES LAST ======================

// Accept (Verify) service provider
router.put("/accept/:id", async (req, res) => {
  try {
    const updatedProvider = await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { status: "verified" },
      { new: true }
    );
    if (!updatedProvider) {
      return res.status(404).json({ error: "Service provider not found" });
    }
    res.json({ message: "Service provider verified successfully", provider: updatedProvider });
  } catch (error) {
    console.error("Error verifying provider:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Reject (Delete) service provider
router.delete("/reject/:id", async (req, res) => {
  try {
    const deleted = await ServiceProvider.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Service provider not found" });
    }
    res.json({ message: "Service provider rejected and deleted." });
  } catch (error) {
    console.error("Error rejecting provider:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete service provider by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedProvider = await ServiceProvider.findByIdAndDelete(req.params.id);

    if (!deletedProvider) {
      return res.status(404).json({ message: "Service Provider not found" });
    }

    res.status(200).json({
      message: "Service Provider deleted successfully",
      deletedId: req.params.id,
    });
  } catch (error) {
    console.error("Error deleting service provider:", error);
    res.status(500).json({
      message: "Server error while deleting service provider",
    });
  }
});

module.exports = router;