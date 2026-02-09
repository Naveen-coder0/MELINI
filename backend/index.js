import express from "express";
import Razorpay from "razorpay";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

/* -------------------- SCHEMA -------------------- */

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    price: Number,
    originalPrice: Number,
    description: String,
    shortDescription: String,
    category: String,
    images: [String],
    sizes: [String],
    colors: [{ name: String, value: String }],
    inStock: Boolean,
    isNew: Boolean,
    isBestSeller: Boolean,
    material: String,
    careInstructions: [String],
    features: [String],
  },
  { timestamps: true }
);

ProductSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);

/* -------------------- HELPERS -------------------- */

const slugify = (v = "") =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

/* -------------------- ROUTES -------------------- */

/* payment */
app.post("/create-order", asyncRoute(async (req, res) => {
  const { amount } = req.body;

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return res.status(500).json({ error: "razorpay config missing" });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const order = await razorpay.orders.create({
    amount: Number(amount) * 100,
    currency: "INR",
    receipt: `melini_${Date.now()}`,
  });

  res.json(order);
}));

/* products */

app.get("/products", asyncRoute(async (req, res) => {
  const items = await Product.find().sort({ createdAt: -1 });
  const total = await Product.countDocuments();

  res.json({
    items,
    total,
  });
}));

app.get("/products/:slug", asyncRoute(async (req, res) => {
  const p = await Product.findOne({ slug: req.params.slug });
  if (!p) return res.status(404).json({ error: "not found" });
  res.json(p);
}));

/* admin */

app.post("/admin/products", asyncRoute(async (req, res) => {
  const payload = { ...req.body };
  payload.slug = slugify(payload.name);

  const p = await Product.create(payload);
  res.status(201).json(p);
}));

app.put("/admin/products/:id", asyncRoute(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: "not found" });
  }

  const payload = { ...req.body };
  payload.slug = slugify(payload.name);

  const p = await Product.findByIdAndUpdate(
    req.params.id,
    payload,
    { new: true }
  );

  if (!p) return res.status(404).json({ error: "not found" });

  res.json(p);
}));

app.delete("/admin/products/:id", asyncRoute(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ error: "not found" });
  }

  const deleted = await Product.findByIdAndDelete(req.params.id);

  if (!deleted) return res.status(404).json({ error: "not found" });

  res.json({ success: true });
}));

/* health */

app.get("/", (_, res) => {
  res.send("MELINI backend running");
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err?.message || "internal server error" });
});

/* -------------------- DB -------------------- */

let connected = false;

async function connectDB() {
  if (connected || mongoose.connection.readyState === 1) {
    connected = true;
    return;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(MONGODB_URI);
  connected = true;
}

if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log("local backend running");
    });
  });
}

export { connectDB };
export default app;
