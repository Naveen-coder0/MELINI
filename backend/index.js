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
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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

/* ---------------- ORDER SCHEMA ---------------- */

const OrderSchema = new mongoose.Schema(
  {
    user: { type: String }, // Assuming user ID will be a string for now, or ObjectId if a User schema is added
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        size: String,
        color: { name: String, value: String },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    customer: {
      name: String,
      email: String,
      phone: String,
    },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    discountAmount: { type: Number, default: 0.0 },
    orderNotes: String,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

/* ---------------- COUPON SCHEMA ---------------- */

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", CouponSchema);

/* ---------------- REVIEW SCHEMA ---------------- */

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    user: { type: String, required: true }, // Assuming user ID will be a string for now
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [String],
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", ReviewSchema);

/* ---------------- SITE CONFIG SCHEMA ---------------- */

const SiteConfigSchema = new mongoose.Schema(
  {
    heroTitle: String,
    heroSubtitle: String,
    heroBadge: String,
    announcement: String,
    promoBannerUrl: String,
    promoLink: String,
    // Store Identity (from Settings)
    storeName: { type: String, default: "MELINI" },
    tagline: { type: String, default: "Timeless Indian Clothing" },
    contactEmail: String,
    whatsapp: String,
    instagram: String,
    announcementBar: String, // Redundant but keeping for compatibility, mapped to 'announcement'
    freeShippingThreshold: { type: Number, default: 999 },
    currency: { type: String, default: "INR" },
    maintenanceMode: { type: Boolean, default: false },
    announcements: [
      {
        message: String,
        isActive: { type: Boolean, default: true },
        startDate: Date,
        endDate: Date,
      },
    ],
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      pinterest: String,
      youtube: String,
    },
    contactInfo: {
      email: String,
      phone: String,
      address: String,
    },
    seoDefaults: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

const SiteConfig = mongoose.model("SiteConfig", SiteConfigSchema);

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

/* ---------------- ORDERS ---------------- */

router.get("/admin/orders", verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ items: orders.map(toClient) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/admin/orders/:id", verifyAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(toClient(order));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.put("/admin/orders/:id", verifyAdmin, async (req, res) => {
  try {
    const { id, _id, ...body } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(toClient(order));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

router.patch("/admin/orders/:id", verifyAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(toClient(order));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

router.delete("/admin/orders/:id", verifyAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

/* 🛒 Public Order Creation (After Payment) */
router.post("/orders", async (req, res) => {
  try {
    const order = await Order.create(req.body);
    // Increment coupon usedCount if a coupon was applied
    if (req.body.coupon) {
      await Coupon.findByIdAndUpdate(req.body.coupon, { $inc: { usedCount: 1 } });
    }
    res.status(201).json(toClient(order));
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: "Failed to create order record" });
  }
});

/* ---------------- COUPONS ---------------- */

router.get("/admin/coupons", verifyAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ items: coupons.map(toClient) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

router.post("/admin/coupons", verifyAdmin, async (req, res) => {
  try {
    const { id, _id, ...body } = req.body;
    const coupon = await Coupon.create(body);
    res.status(201).json(toClient(coupon));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create coupon" });
  }
});

router.get("/admin/coupons/:id", verifyAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });
    res.json(toClient(coupon));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coupon" });
  }
});

router.put("/admin/coupons/:id", verifyAdmin, async (req, res) => {
  try {
    const { id, _id, ...body } = req.body;
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });
    res.json(toClient(coupon));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

router.patch("/admin/coupons/:id", verifyAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });
    res.json(toClient(coupon));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update coupon" });
  }
});

router.delete("/admin/coupons/:id", verifyAdmin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
});

/* ---------------- COUPON VALIDATE (public) ---------------- */

router.post("/coupons/validate", async (req, res) => {
  const { code, orderAmount } = req.body;
  if (!code) return res.status(400).json({ error: "Coupon code is required" });

  try {
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon)
      return res.status(404).json({ error: "Invalid coupon code" });
    if (!coupon.isActive)
      return res.status(400).json({ error: "This coupon is no longer active" });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
      return res.status(400).json({ error: "This coupon has expired" });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ error: "This coupon has reached its usage limit" });
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount)
      return res.status(400).json({
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
      });

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((orderAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount)
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    } else {
      discountAmount = Math.min(coupon.discountValue, orderAmount);
    }

    res.json({
      valid: true,
      discountAmount,
      couponId: coupon._id.toString(),
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to validate coupon" });
  }
});

/* ---------------- REVIEWS ---------------- */

router.get("/admin/reviews", verifyAdmin, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ items: reviews.map(toClient) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

router.get("/admin/reviews/:id", verifyAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(toClient(review));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch review" });
  }
});

router.put("/admin/reviews/:id", verifyAdmin, async (req, res) => {
  try {
    const { id, _id, ...body } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true, runValidators: true }
    );
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(toClient(review));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update review" });
  }
});

router.patch("/admin/reviews/:id", verifyAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(toClient(review));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update review" });
  }
});

router.delete("/admin/reviews/:id", verifyAdmin, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

/* ---------------- SITE CONFIGURATION ---------------- */

router.get("/site-config", async (req, res) => {
  try {
    let siteConfig = await SiteConfig.findOne();
    if (!siteConfig) {
      siteConfig = await SiteConfig.create({}); // Create a default if none exists
    }
    res.json(toClient(siteConfig));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch site configuration" });
  }
});

router.get("/admin/site-config", verifyAdmin, async (req, res) => {
  try {
    let siteConfig = await SiteConfig.findOne();
    if (!siteConfig) {
      siteConfig = await SiteConfig.create({}); // Create a default if none exists
    }
    res.json(toClient(siteConfig));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch site configuration" });
  }
});

router.put("/admin/site-config", verifyAdmin, async (req, res) => {
  try {
    const { id, _id, ...body } = req.body;
    let siteConfig = await SiteConfig.findOne();
    if (!siteConfig) {
      siteConfig = await SiteConfig.create(body);
    } else {
      siteConfig = await SiteConfig.findByIdAndUpdate(
        siteConfig._id,
        body,
        { new: true, runValidators: true }
      );
    }
    res.json(toClient(siteConfig));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update site configuration" });
  }
});

/* ---------------- SETTINGS ---------------- */

/* ---------------- SETTINGS (Unified with SiteConfig) ---------------- */

router.get("/admin/settings", verifyAdmin, async (req, res) => {
  try {
    let siteConfig = await SiteConfig.findOne();
    if (!siteConfig) {
      siteConfig = await SiteConfig.create({});
    }
    // Map SiteConfig to the structure expected by SettingsTab
    const settings = {
      storeName: siteConfig.storeName,
      tagline: siteConfig.tagline,
      contactEmail: siteConfig.contactEmail,
      whatsapp: siteConfig.whatsapp,
      instagram: siteConfig.instagram,
      announcementBar: siteConfig.announcement || siteConfig.announcementBar,
      freeShippingThreshold: siteConfig.freeShippingThreshold,
      currency: siteConfig.currency,
    };
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

router.put("/admin/settings", verifyAdmin, async (req, res) => {
  try {
    let siteConfig = await SiteConfig.findOne();
    const updateData = { ...req.body };
    if (updateData.announcementBar) {
      updateData.announcement = updateData.announcementBar;
    }

    if (!siteConfig) {
      siteConfig = await SiteConfig.create(updateData);
    } else {
      siteConfig = await SiteConfig.findByIdAndUpdate(siteConfig._id, updateData, { new: true });
    }
    res.json(siteConfig);
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

// Only start the HTTP server in local / non-serverless environments
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`Backend running on port ${PORT}`);
    try {
      await connectDB();
    } catch (err) {
      console.error("DB connection failed:", err.message);
    }
  });
}

export { connectDB };
export default app;