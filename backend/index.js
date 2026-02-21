import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const router = express.Router(); // ✅ NEW

const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

/* -------------------- AUTH -------------------- */

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

/* -------------------- ROUTES -------------------- */

/* AUTH */
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

/* PRODUCTS */
router.get("/products", async (req, res) => {
  try {
    const items = await mongoose.model("Product").find().sort({ createdAt: -1 });
    res.json({ items });
  } catch {
    res.json({ items: [] });
  }
});

router.get("/products/:slug", async (req, res) => {
  const p = await mongoose.model("Product").findOne({ slug: req.params.slug });
  if (!p) return res.status(404).json({ error: "not found" });
  res.json(p);
});

/* CREATE ORDER */
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

/* UPLOAD */
router.post("/upload", verifyAdmin, async (req, res) => {
  const { data } = req.body;
  const result = await cloudinary.uploader.upload(data, {
    folder: "melini",
  });
  res.json({ url: result.secure_url });
});

/* HEALTH */
app.get("/", (_req, res) => {
  res.send("MELINI backend running");
});

/* ✅ THIS IS THE MAGIC LINE */
app.use("/api", router);

/* ERROR HANDLER */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err?.message || "internal server error" });
});

/* DB CONNECT */
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