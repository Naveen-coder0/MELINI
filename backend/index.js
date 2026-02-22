import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import fileUpload from "express-fileupload";

dotenv.config();

const app = express();
const router = express.Router();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

/* ---------------- CLOUDINARY ---------------- */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ---------------- PRODUCT SCHEMA ---------------- */

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true, sparse: true },
    price: Number,
    originalPrice: Number,
    description: String,
    shortDescription: String,
    images: [String],
    category: String,
    sizes: [String],
    colors: [{
      name: String,
      value: String,
      images: [String]
    }],
    inStock: { type: Boolean, default: true },
    isBestSeller: Boolean,
    isNewProduct: Boolean,
    material: String,
    careInstructions: [String],
    features: [String],
    articleNo: { type: String, sparse: true },
    sizePricing: [{ size: String, price: Number, originalPrice: Number }],
    metaTitle: String,
    metaDescription: String,
    tags: [String],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

/* ---------------- SETTINGS SCHEMA ---------------- */

const SettingsSchema = new mongoose.Schema({
  storeName: { type: String, default: "MELINI" },
  tagline: { type: String, default: "Timeless Indian Clothing" },
  contactEmail: String,
  whatsapp: String,
  instagram: String,
  announcementBar: { type: String, default: "Free shipping on orders above ₹999" },
  freeShippingThreshold: { type: Number, default: 999 },
  currency: { type: String, default: "INR" },
}, { timestamps: true });

const Settings = mongoose.model("Settings", SettingsSchema);

/* ---------------- AUTH ---------------- */

const verifyAdmin = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    console.warn("Auth failed: Missing or malformed Authorization header");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = auth.slice(7);

  if (!process.env.JWT_SECRET) {
    console.error("CRITICAL ERROR: JWT_SECRET is not defined in environment variables!");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    console.warn("Auth failed: Invalid or expired token", {
      error: err.message,
      token_prefix: token.slice(0, 10) + "..."
    });
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

router.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });

  res.json({ token });
});

/* ---------------- PRODUCTS ---------------- */

// Helper to normalise a Mongo doc so the frontend gets `id` instead of `_id`
const toClient = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
};

router.get("/products", async (req, res) => {
  try {
    const items = await Product.find().sort({ createdAt: -1 });
    res.json({ items: items.map(toClient) });
  } catch (err) {
    console.error(err);
    res.json({ items: [] });
  }
});

router.get("/products/:slug", async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(toClient(product));
});

/* ✅ CREATE PRODUCT (THIS WAS MISSING) */

router.post("/admin/products", verifyAdmin, async (req, res) => {
  try {
    // Strip any client-supplied id so Mongo generates a fresh _id
    const { id, _id, ...body } = req.body;
    const product = await Product.create(body);
    res.status(201).json(toClient(product));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.put("/admin/products/:id", verifyAdmin, async (req, res) => {
  try {
    const { id, _id, ...body } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ error: "Not found" });
    res.json(toClient(product));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/admin/products/:id", verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

/* ---------------- SETTINGS ---------------- */

router.get("/admin/settings", verifyAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/admin/settings", verifyAdmin, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true });
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

/* ---------------- CREATE ORDER ---------------- */

router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: Number(amount) * 100,
    currency: "INR",
    receipt: `melini_${Date.now()}`,
  });

  res.json(razorpayOrder);
});

/* ---------------- UPLOAD ---------------- */

router.post("/upload", verifyAdmin, async (req, res) => {
  try {
    let uploadPath;

    if (req.files && req.files.file) {
      // Handle file upload
      uploadPath = req.files.file.tempFilePath;
    } else if (req.body.data) {
      // Handle base64 upload
      uploadPath = req.body.data;
    } else {
      return res.status(400).json({ error: "No file or data uploaded" });
    }

    console.log("Attempting Cloudinary upload...");
    const result = await cloudinary.uploader.upload(uploadPath, {
      folder: "melini",
      resource_type: "auto"
    });

    console.log("Cloudinary upload successful:", result.secure_url);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Detailed Cloudinary Upload Error:", {
      message: err.message,
      stack: err.stack,
      cloudinary_error: err
    });
    res.status(500).json({
      error: "Upload failed",
      details: err.message
    });
  }
});

router.delete("/upload", verifyAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    // Extract public_id from Cloudinary URL
    const parts = url.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${filename}`;

    console.log("Attempting Cloudinary delete for:", publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, result });
  } catch (err) {
    console.error("Cloudinary Delete Error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

/* ---------------- HEALTH ---------------- */

app.get("/", (_req, res) => {
  res.send("MELINI backend running");
});

app.use("/api", router);

/* ---------------- DB CONNECT ---------------- */

async function connectDB() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI missing");
  await mongoose.connect(MONGODB_URI);
  console.log("DB connected");
}

app.listen(PORT, async () => {
  console.log(`Backend running on port ${PORT}`);
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connection failed:", err.message);
  }
});