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
const PORT = Number(process.env.PORT) || 5000;
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

// In-memory OTP store { email: { code, expiry } }
const otpStore = {};

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASS },
});

// Step 1: validate credentials → return JWT directly (OTP disabled for now)
app.post("/admin/login", (req, res) => {
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

// (OTP verify — kept for future re-enable)
app.post("/admin/auth/verify", (req, res) => {
  const { otp } = req.body;
  const stored = otpStore[process.env.ADMIN_EMAIL];
  if (!stored || Date.now() > stored.expiry) {
    return res.status(401).json({ error: "OTP expired. Please login again." });
  }
  if (otp !== stored.code) {
    return res.status(401).json({ error: "Incorrect OTP" });
  }
  delete otpStore[process.env.ADMIN_EMAIL];
  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "8h",
  });
  res.json({ token });
});


/* -------------------- UPLOAD -------------------- */

app.post("/upload", verifyAdmin, async (req, res) => {
  try {
    const { data } = req.body; // base64 data URL
    if (!data) return res.status(400).json({ error: "No image data" });
    const result = await cloudinary.uploader.upload(data, {
      folder: "melini",
      resource_type: "auto",
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.delete("/upload", verifyAdmin, async (req, res) => {
  try {
    const { url } = req.body;
    console.log("[DELETE /upload] URL:", url);
    if (!url) return res.status(400).json({ error: "No URL provided" });

    // Extract public_id from Cloudinary URL
    // e.g. https://res.cloudinary.com/cloud/image/upload/v123456/melini/abc.jpg
    //   -> public_id = "melini/abc"
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+\.\w+)$/);
    if (!match) {
      console.log("[DELETE /upload] No match for URL:", url);
      return res.status(400).json({ error: "Invalid Cloudinary URL" });
    }

    // Remove file extension from public_id
    const publicId = match[1].replace(/\.[^.]+$/, "");
    console.log("[DELETE /upload] Destroying public_id:", publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("[DELETE /upload] Result:", result);
    res.json({ success: true, result });
  } catch (err) {
    console.error("[DELETE /upload] Error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

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
    isNewProduct: Boolean,
    isBestSeller: Boolean,
    material: String,
    careInstructions: [String],
    features: [String],
    // SEO
    metaTitle: String,
    metaDescription: String,
    tags: [String],
  },
  { timestamps: true }
);

/* Order Schema */
const OrderSchema = new mongoose.Schema(
  {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    amount: Number,
    currency: { type: String, default: 'INR' },
    status: { type: String, default: 'created' }, // created | paid | failed
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    items: [{ name: String, price: Number, qty: Number }],
    notes: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

/* Store Settings Schema (single-document: upsert by key='main') */
const SettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  storeName: { type: String, default: 'MELINI' },
  tagline: { type: String, default: 'Timeless Indian Clothing' },
  contactEmail: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  instagram: { type: String, default: '' },
  announcementBar: { type: String, default: 'Free shipping on orders above ₹999' },
  freeShippingThreshold: { type: Number, default: 999 },
  currency: { type: String, default: 'INR' },
});

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

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

const asyncRoute =
  (handler) =>
    (req, res, next) => {
      Promise.resolve(handler(req, res, next)).catch(next);
    };


/* -------------------- ROUTES -------------------- */

/* payment */
app.post(
  "/create-order",
  asyncRoute(async (req, res) => {
    const { amount, customerName, customerEmail, customerPhone, items } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: "razorpay config missing" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `melini_${Date.now()}`,
    });

    // Save order to DB
    try {
      await Order.create({
        razorpayOrderId: razorpayOrder.id,
        amount: Number(amount),
        status: 'created',
        customerName, customerEmail, customerPhone,
        items: items || [],
      });
    } catch (dbErr) {
      console.warn('[Order] DB save failed:', dbErr.message);
    }

    res.json(razorpayOrder);
  })
);

/* payment verify callback — mark order as paid */
app.post(
  "/payment/verify",
  asyncRoute(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id } = req.body;
    try {
      await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'paid', razorpayPaymentId: razorpay_payment_id },
      );
    } catch (err) {
      console.warn('[Order verify] DB update failed:', err.message);
    }
    res.json({ success: true });
  })
);

/* admin: list orders */
app.get(
  "/admin/orders",
  verifyAdmin,
  asyncRoute(async (_req, res) => {
    try {
      const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
      res.json({ orders });
    } catch {
      res.json({ orders: [] });
    }
  })
);

/* admin: update order status */
app.patch(
  "/admin/orders/:id",
  verifyAdmin,
  asyncRoute(async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  })
);

/* admin: settings GET */
app.get(
  "/admin/settings",
  verifyAdmin,
  asyncRoute(async (_req, res) => {
    try {
      let s = await Settings.findOne({ key: 'main' });
      if (!s) s = await Settings.create({ key: 'main' });
      res.json(s);
    } catch {
      res.json({ storeName: 'MELINI', tagline: '', contactEmail: '', whatsapp: '', instagram: '', announcementBar: '', freeShippingThreshold: 999, currency: 'INR' });
    }
  })
);

/* admin: settings PUT */
app.put(
  "/admin/settings",
  verifyAdmin,
  asyncRoute(async (req, res) => {
    try {
      const s = await Settings.findOneAndUpdate(
        { key: 'main' },
        { ...req.body, key: 'main' },
        { new: true, upsert: true }
      );
      res.json(s);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })
);

/* products */

app.get(
  "/products",
  asyncRoute(async (_req, res) => {
    try {
      const items = await Product.find().sort({ createdAt: -1 });
      const total = await Product.countDocuments();
      res.json({ items, total });
    } catch {
      // DB unavailable — return empty list so frontend silently keeps seed data
      res.json({ items: [], total: 0 });
    }
  })
);

app.get(
  "/products/:slug",
  asyncRoute(async (req, res) => {
    const p = await Product.findOne({ slug: req.params.slug });
    if (!p) return res.status(404).json({ error: "not found" });
    res.json(p);
  })
);

/* admin */

app.post(
  "/admin/products",
  verifyAdmin,
  asyncRoute(async (req, res) => {
    const payload = { ...req.body };
    payload.slug = slugify(payload.name);

    try {
      const p = await Product.create(payload);
      res.status(201).json(p);
    } catch {
      // DB unavailable — return the payload as-is so frontend can use it in memory
      res.status(201).json({ ...payload, id: `local-${Date.now()}` });
    }
  })
);

app.put(
  "/admin/products/:id",
  verifyAdmin,
  asyncRoute(async (req, res) => {
    const payload = { ...req.body };
    payload.slug = slugify(payload.name);

    const p = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });

    if (!p) return res.status(404).json({ error: "not found" });

    res.json(p);
  })
);

app.delete(
  "/admin/products/:id",
  verifyAdmin,
  asyncRoute(async (req, res) => {
    try {
      // Fetch product first so we can delete its Cloudinary images
      const product = await Product.findById(req.params.id);
      if (product?.images?.length > 0) {
        const results = await Promise.allSettled(
          product.images
            .filter((url) => url.includes("cloudinary.com"))
            .map(async (url) => {
              const match = url.match(/\/upload\/(?:v\d+\/)?(.+\.\w+)$/);
              if (!match) {
                console.log("[Product delete] Could not parse URL:", url);
                return;
              }
              const publicId = match[1].replace(/\.[^.]+$/, "");
              console.log("[Product delete] Destroying public_id:", publicId);
              const r = await cloudinary.uploader.destroy(publicId);
              console.log("[Product delete] Result for", publicId, ":", r);
              return r;
            })
        );
        results.forEach((r, i) => {
          if (r.status === "rejected") console.error("[Product delete] Image", i, "failed:", r.reason);
        });
      }
      await Product.findByIdAndDelete(req.params.id);
    } catch (err) {
      console.log("[Product delete] Error (non-fatal):", err?.message);
      // DB unavailable or ID not found — treat as success
    }
    res.json({ success: true });
  })
);

/* health */

app.get("/", (_req, res) => {
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
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    // Connect to DB in the background after server is already listening
    connectDB()
      .then(() => {
        console.log("DB connected successfully");
      })
      .catch((err) => {
        console.error("DB connection failed:", err.message);
        console.log("Server running without DB – product APIs will not work until DB is available.");
      });
  });
}

export { connectDB };
export default app;
