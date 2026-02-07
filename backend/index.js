import express from 'express';
import Razorpay from 'razorpay';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

const JWT_SECRET = process.env.JWT_SECRET || 'melini-admin-secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@melini.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['summer', 'semi-winter', 'winter'],
    },
    images: [{ type: String, required: true }],
    sizes: [{ type: String, required: true }],
    colors: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    inStock: { type: Boolean, default: true },
    isNew: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    material: { type: String, required: true },
    careInstructions: [{ type: String, required: true }],
    features: [{ type: String, required: true }],
  },
  { timestamps: true }
);

ProductSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Product = mongoose.model('Product', ProductSchema);

const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const parseBool = (value) => {
  if (value === undefined) return undefined;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
};

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const number = Number(value);
  return Number.isNaN(number) ? undefined : number;
};

/* -------------------- ADMIN AUTH -------------------- */

const createAdminToken = () =>
  jwt.sign(
    { role: 'admin', email: ADMIN_EMAIL },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing admin token' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded?.role !== 'admin') {
      return res.status(403).json({ error: 'Invalid admin token' });
    }

    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/* -------------------- RAZORPAY -------------------- */

app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: `melini_${Date.now()}`,
    });

    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

/* -------------------- PUBLIC PRODUCTS -------------------- */

app.get('/api/products', async (req, res) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      inStock,
      sort = 'newest',
      page = '1',
      limit = '100',
    } = req.query;

    const filter = {};

    if (category && category !== 'all') {
      filter.category = category;
    }

    const inStockBool = parseBool(inStock);
    if (typeof inStockBool === 'boolean') {
      filter.inStock = inStockBool;
    }

    const min = parseNumber(minPrice);
    const max = parseNumber(maxPrice);
    if (min !== undefined || max !== undefined) {
      filter.price = {};
      if (min !== undefined) filter.price.$gte = min;
      if (max !== undefined) filter.price.$lte = max;
    }

    if (search) {
      const regex = new RegExp(String(search), 'i');
      filter.$or = [
        { name: regex },
        { description: regex },
        { shortDescription: regex },
        { material: regex },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
      'best-selling': { isBestSeller: -1, createdAt: -1 },
    };

    const pageNumber = Math.max(1, parseInt(String(page), 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 20));

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Product.countDocuments(filter),
    ]);

    return res.json({
      items,
      total,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

/* -------------------- ADMIN AUTH API -------------------- */

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const isValid = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const token = createAdminToken();
  return res.json({ token, admin: { email: ADMIN_EMAIL } });
});

app.get('/api/auth/me', requireAdminAuth, (req, res) => {
  return res.json({ admin: { email: req.admin.email } });
});

/* -------------------- ADMIN PRODUCTS -------------------- */

app.post('/api/admin/products', requireAdminAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.slug = payload.slug
      ? slugify(payload.slug)
      : slugify(payload.name);

    const product = await Product.create(payload);
    return res.status(201).json(product);
  } catch (error) {
    console.error(error);
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'Product slug already exists' });
    }
    return res.status(400).json({ error: 'Failed to create product' });
  }
});

app.put('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.slug = payload.slug
      ? slugify(payload.slug)
      : slugify(payload.name);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    console.error(error);
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'Product slug already exists' });
    }
    return res.status(400).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/admin/products/:id', requireAdminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Failed to delete product' });
  }
});

/* -------------------- START -------------------- */

app.get('/', (_, res) => {
  res.send('MELINI backend is running');
});

const start = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
};

start();
