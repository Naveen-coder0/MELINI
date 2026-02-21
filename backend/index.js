import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const router = express.Router();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

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
    colors: [{ name: String, value: String }],
    inStock: { type: Boolean, default: true },
    isBestSeller: Boolean,
    isNewProduct: Boolean,
    material: String,
    careInstructions: [String],
    features: [String],
    articleNo: { type: String, sparse: true },
    sizePricing: [{ size: String, price: Number }],
    metaTitle: String,
    metaDescription: String,
    tags: [String],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);

/* ---------------- AUTH ---------------- */

const verifyAdmin = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = auth.slice(7);

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
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
  const { data } = req.body;

  const result = await cloudinary.uploader.upload(data, {
    folder: "melini",
  });

  res.json({ url: result.secure_url });
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