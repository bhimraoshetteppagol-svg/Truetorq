import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';

const app = express();
const PORT = 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB — TrueTorq cluster, protorq database only
const DB_NAME = process.env.MONGODB_DB_NAME || 'protorq';

const buildMongoUri = () => {
  const base = process.env.MONGODB_URI || 'mongodb+srv://user:user@truetorq.qitevte.mongodb.net/?appName=TrueTorq';
  if (/mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(base)) {
    return base;
  }
  const qIndex = base.indexOf('?');
  if (qIndex === -1) {
    const slash = base.endsWith('/') ? '' : '/';
    return `${base}${slash}${DB_NAME}`;
  }
  const path = base.slice(0, qIndex);
  const query = base.slice(qIndex + 1);
  const slash = path.endsWith('/') ? '' : '/';
  return `${path}${slash}${DB_NAME}?${query}`;
};

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 30000,
  bufferCommands: false,
};

const isDbConnected = () => mongoose.connection.readyState === 1;

const connectMongo = async () => {
  await mongoose.connect(buildMongoUri(), MONGO_OPTIONS);
  console.log('✅ Successfully connected to MongoDB');
  console.log(`📁 Database: ${mongoose.connection.name || DB_NAME}`);

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('📋 Collections:', collections.map((c) => c.name));

  if (collections.find((c) => c.name === 'users')) {
    const userCount = await db.collection('users').countDocuments();
    console.log('👥 Users:', userCount);
  }

  if (collections.find((c) => c.name === 'leads')) {
    const leadCount = await db.collection('leads').countDocuments();
    console.log('📊 Leads:', leadCount);
  }
};

// Schemas — all collections live in the protorq database
const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employee', 'user'] }
}, { 
  timestamps: true,
  collection: 'users', // Explicitly use the 'users' collection
  strict: false // Allow fields not in schema (like __v)
});

const LeadSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  requesterEmail: { type: String, required: true },
  contactNumber: { type: String },
  quotationFor: {
    company: { type: String },
    name: { type: String },
    location: { type: String },
    kindAttn: { type: String },
    phone: { type: String },
    reference: { type: String },
  },
  quantity: { type: Number, default: 1 },
  quantityRequested: { type: Number },
  status: { type: String, enum: ['pending', 'assigned', 'in-progress', 'completed'], default: 'pending' },
  assignedTo: { type: String },
  assignedEmployee: { type: String },
  quotation: { type: mongoose.Schema.Types.Mixed },
  comments: [{
    comment: String,
    authorType: { type: String, enum: ['admin', 'employee'] },
    createdAt: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true,
  collection: 'leads', // Explicitly use the 'leads' collection
  strict: false // Allow fields not in schema (like assignedEmployee)
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String }
}, { 
  timestamps: true,
  collection: 'products' // Explicitly use the 'products' collection
});

const QuotationSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  products: [mongoose.Schema.Types.Mixed],
  terms: mongoose.Schema.Types.Mixed,
  verify: mongoose.Schema.Types.Mixed,
  currency: { type: String },
  pdf: { type: Buffer }
}, { timestamps: true, collection: 'quotations' });

const getUserModel = () =>
  mongoose.models.User || mongoose.model('User', UserSchema, 'users');
const getLeadModel = () =>
  mongoose.models.Lead || mongoose.model('Lead', LeadSchema, 'leads');
const getProductModel = () =>
  mongoose.models.Product || mongoose.model('Product', ProductSchema, 'products');
const getQuotationModel = () =>
  mongoose.models.Quotation || mongoose.model('Quotation', QuotationSchema, 'quotations');

const requireDb = (req, res, next) => {
  if (isDbConnected()) return next();
  return res.status(503).json({
    message:
      'Database is not connected. Check MongoDB Atlas network access (IP whitelist) and that the cluster is reachable.',
  });
};

const findUserInDatabase = async (email) => {
  const UserModel = getUserModel();
  const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let user = await UserModel.findOne({ email });
  if (user) return user;

  user = await UserModel.findOne({ email: new RegExp(`^${escaped}$`, 'i') });
  if (user) return user;

  return UserModel.findOne({ email: email.toLowerCase() });
};

const resolveLead = async (leadId) => getLeadModel().findById(leadId);

const buildQuotationPdfBuffer = ({ lead, products = [], terms = {}, verify = {}, currency = '₹' }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const now = new Date();
    const quotationNo = verify?.quotationNo || `TT${String(lead._id).slice(-8).toUpperCase()}`;
    const formattedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const validDays = Number(terms?.validityDays || 30);
    const validUntil = `${validDays} Days`;

    const companyName = verify?.companyName || verify?.customerCompany || 'LULU INDIA SHOPPING MALL PVT LTD';
    const customerName = verify?.customerName || verify?.contactPerson || companyName;
    const location = verify?.location || [verify?.addressLine1, verify?.addressLine2].filter(Boolean).join(', ') || '-';
    const kindAttn = verify?.kindAttn || companyName;
    const refValue = verify?.reference || String(lead._id).slice(-10).toUpperCase();
    const preparedBy = verify?.preparedBy || verify?.primaryEmail || 'sales@truetorq.com';
    const contactNo = verify?.pnsPhone || verify?.primaryPhone || verify?.alternatePhone || lead.contactNumber || '-';
    const emailId = verify?.primaryEmail || lead.requesterEmail || '-';

    const companyAddressLines = [
      'NO C-53, 6TH CROSS',
      'KSSIDC INDUSTRIAL AREA, GAMANAGATTI',
      'Hubballi, Karnataka, India 580025',
      '+91-9028368529 | info@truetorq.com',
      'Website: www.truetorq.com',
      'GSTN: 29AAMCT1766D1Z2',
    ];

    const lineItems = Array.isArray(products) && products.length > 0 ? products : [{
      productName: lead.productName || 'TT Coupling',
      description: '',
      quantity: lead.quantityRequested || lead.quantity || 1,
      price: 0,
      unit: 'Nos',
      hsn: verify?.defaultHsn || '84836010',
    }];

    const normalizedItems = lineItems.map((item) => {
      const qty = Number(item.quantity || 1);
      const rawPrice = Number(item.price || 0);
      const discountPct = Number(item.discount || terms?.discount || 0);
      const unitPrice = Number.isFinite(rawPrice) ? rawPrice : 0;
      const finalPrice = unitPrice - (unitPrice * discountPct / 100);
      return {
        productName: item.productName || item.name || item.product || 'TT Coupling',
        description: item.description || '-',
        qty,
        hsn: String(item.hsn || item.hsnCode || verify?.defaultHsn || '84836010'),
        unitPrice,
        discountPct,
        finalPrice,
        amount: finalPrice * qty,
        make: item.make || 'TrueTorq',
        design: item.design || '2.0',
        model: item.model || '-',
      };
    });

    const subTotal = normalizedItems.reduce((acc, item) => acc + item.amount, 0);
    const orderDiscountPct = Number(terms?.discount || 0);
    const orderDiscountAmount = orderDiscountPct > 0 ? (subTotal * orderDiscountPct) / 100 : 0;
    const discountedTotal = subTotal - orderDiscountAmount;
    const freightAmount = Number(terms?.shippingCharges || 0);
    const effectiveFreight = terms?.shippingIncluded ? 0 : freightAmount;
    const gstPercent = Number(terms?.applicableTaxes || terms?.gstPercent || terms?.applicableTaxesPercent || 18);
    const taxableAmount = terms?.taxesIncluded ? 0 : (discountedTotal + effectiveFreight);
    const gstAmount = (taxableAmount * gstPercent) / 100;
    const grandTotal = discountedTotal + effectiveFreight + gstAmount;

    const pageWidth = doc.page.width;
    const left = 52;
    const right = pageWidth - 52;
    const tableWidth = right - left;

    doc.rect(0, 0, pageWidth, doc.page.height).fill('#ececec');
    doc.fillColor('#000000');

    doc.font('Helvetica-Bold').fontSize(14).text('TRUETORQ PRIVATE LIMITED', left, 52, { width: 320 });
    doc.font('Helvetica').fontSize(8.6);
    let companyY = 80;
    companyAddressLines.forEach((line, idx) => {
      if (idx === companyAddressLines.length - 1) {
        doc.font('Helvetica-Bold').text(line, left, companyY, { width: 320 });
        doc.font('Helvetica');
      } else {
        doc.text(line, left, companyY, { width: 320 });
      }
      companyY += 15;
    });

    const logoX = right - 140;
    const logoY = 52;
    doc.circle(logoX + 58, logoY + 34, 30).lineWidth(3).strokeColor('#2f5aa8').stroke();
    doc.font('Helvetica-Bold').fontSize(44).fillColor('#2f5aa8').text('tt', logoX + 30, logoY + 12, { width: 60, align: 'center' });
    doc.fillColor('#4b5563').font('Helvetica').fontSize(20).text('C', logoX + 64, logoY + 8, { width: 50, align: 'center' });
    doc.fillColor('#000000');

    doc.font('Helvetica').fontSize(37 / 2).fillColor('#6b7280').text('Quotation', right - 118, 156, { width: 118, align: 'right' });
    doc.moveTo(right - 205, 182).lineTo(right, 182).strokeColor('#8b8b8b').lineWidth(0.8).stroke();
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10).text('DATE', right - 170, 188, { width: 45, align: 'left' });
    doc.font('Helvetica').fontSize(10).text(formattedDate, right - 120, 188, { width: 120, align: 'left' });
    doc.font('Helvetica-Bold').text('Quotation #', right - 170, 206, { width: 80, align: 'left' });
    doc.font('Helvetica').text(quotationNo, right - 95, 206, { width: 95, align: 'left' });
    doc.font('Helvetica-Oblique').text('Quotation valid until:', right - 170, 223, { width: 95, align: 'left' });
    doc.font('Helvetica').text(validUntil, right - 75, 223, { width: 75, align: 'left' });

    const preparedY = 241;
    doc.rect(right - 170, preparedY, 170, 58).fill('#dce5c7');
    doc.fillColor('#000000').font('Helvetica-Oblique').fontSize(9).text('Prepared by:', right - 164, preparedY + 6);
    doc.font('Helvetica').text(preparedBy, right - 96, preparedY + 6, { width: 90, align: 'left' });
    doc.font('Helvetica-Oblique').text('Contact No:', right - 164, preparedY + 23);
    doc.font('Helvetica').text(String(contactNo), right - 96, preparedY + 23, { width: 90, align: 'left' });
    doc.font('Helvetica-Oblique').text('Email ID:', right - 164, preparedY + 40);
    doc.font('Helvetica').fontSize(8).text(emailId, right - 96, preparedY + 40, { width: 90, align: 'left' });
    doc.fillColor('#000000');

    let y = 210;
    doc.font('Helvetica-Bold').fontSize(11).text('Quotation For:', left, y);
    y += 16;
    const labelW = 62;
    const valStart = left + labelW + 4;
    const splitX = right - 245;
    const infoRows = [
      { label: 'Company', value: companyName },
      { label: 'Name', value: customerName },
      { label: 'Location', value: location },
      { label: 'Kind attn', value: kindAttn },
      { label: 'Phone', value: String(contactNo) },
      { label: 'Ref', value: refValue },
    ];
    infoRows.forEach((row) => {
      doc.font('Helvetica').fontSize(9).text(`${row.label}:`, left, y, { width: labelW });
      doc.font(row.label === 'Company' ? 'Helvetica-Bold' : 'Helvetica').text(row.value || '-', valStart, y, { width: splitX - valStart });
      doc.moveTo(valStart, y + 14).lineTo(splitX, y + 14).strokeColor('#9ca3af').lineWidth(0.6).stroke();
      y += 18;
    });

    const tableTop = 336;
    const headerH = 26;
    const rowH = 68;
    // Keep total columns exactly within available table width (A4-safe)
    const col = { sl: 24, desc: 92, ttDesc: 110, qty: 28, hsn: 40, unit: 52, discount: 35, final: 48, total: 62 };
    const x = {
      sl: left,
      desc: left + col.sl,
      ttDesc: left + col.sl + col.desc,
      qty: left + col.sl + col.desc + col.ttDesc,
      hsn: left + col.sl + col.desc + col.ttDesc + col.qty,
      unit: left + col.sl + col.desc + col.ttDesc + col.qty + col.hsn,
      discount: left + col.sl + col.desc + col.ttDesc + col.qty + col.hsn + col.unit,
      final: left + col.sl + col.desc + col.ttDesc + col.qty + col.hsn + col.unit + col.discount,
      total: left + col.sl + col.desc + col.ttDesc + col.qty + col.hsn + col.unit + col.discount + col.final,
    };

    doc.rect(left, tableTop, tableWidth, headerH).strokeColor('#808080').lineWidth(0.8).stroke();
    [x.desc, x.ttDesc, x.qty, x.hsn, x.unit, x.discount, x.final, x.total].forEach((vx) => {
      doc.moveTo(vx, tableTop).lineTo(vx, tableTop + headerH).strokeColor('#808080').lineWidth(0.8).stroke();
    });
    doc.font('Helvetica-Bold').fontSize(7.4);
    doc.text('Sl No', x.sl + 3, tableTop + 8, { width: col.sl - 6, align: 'center' });
    doc.text('DESCRIPTION', x.desc + 3, tableTop + 8, { width: col.desc - 6, align: 'center' });
    doc.text('TT\nDESCRIPTION', x.ttDesc + 3, tableTop + 3, { width: col.ttDesc - 6, align: 'center' });
    doc.text('QTY\n(Nos)', x.qty + 2, tableTop + 3, { width: col.qty - 4, align: 'center' });
    doc.text('HSN', x.hsn + 2, tableTop + 8, { width: col.hsn - 4, align: 'center' });
    doc.text('Unit Price', x.unit + 2, tableTop + 8, { width: col.unit - 4, align: 'center' });
    doc.text('Discount', x.discount + 1, tableTop + 8, { width: col.discount - 2, align: 'center' });
    doc.text('Final Price', x.final + 2, tableTop + 8, { width: col.final - 4, align: 'center' });
    doc.text('TOTAL AMOUNT', x.total + 2, tableTop + 8, { width: col.total - 4, align: 'center' });

    let rowY = tableTop + headerH;
    normalizedItems.forEach((item, idx) => {
      doc.rect(left, rowY, tableWidth, rowH).strokeColor('#808080').lineWidth(0.8).stroke();
      [x.desc, x.ttDesc, x.qty, x.hsn, x.unit, x.discount, x.final, x.total].forEach((vx) => {
        doc.moveTo(vx, rowY).lineTo(vx, rowY + rowH).strokeColor('#808080').lineWidth(0.8).stroke();
      });
      doc.font('Helvetica').fontSize(8);
      doc.text(String(idx + 1), x.sl + 3, rowY + 34, { width: col.sl - 6, align: 'center' });
      doc.text(item.productName, x.desc + 3, rowY + 4, { width: col.desc - 6, align: 'left' });
      const ttDescription = [item.model !== '-' ? `Model : ${item.model}` : null, `Make: ${item.make}`, `Design : ${item.design}`]
        .filter(Boolean)
        .join('\n');
      doc.text(ttDescription, x.ttDesc + 4, rowY + 4, { width: col.ttDesc - 8, align: 'left' });
      doc.text(String(item.qty), x.qty + 2, rowY + 34, { width: col.qty - 4, align: 'center' });
      doc.text(item.hsn, x.hsn + 2, rowY + 34, { width: col.hsn - 4, align: 'center' });
      doc.text(item.unitPrice.toLocaleString('en-IN'), x.unit + 2, rowY + 34, { width: col.unit - 4, align: 'right' });
      doc.text(item.discountPct > 0 ? `${item.discountPct}%` : '-', x.discount + 2, rowY + 34, { width: col.discount - 4, align: 'center' });
      doc.text(item.finalPrice.toLocaleString('en-IN'), x.final + 2, rowY + 34, { width: col.final - 4, align: 'right' });
      doc.font('Helvetica-Bold').text(item.amount.toLocaleString('en-IN'), x.total + 2, rowY + 34, { width: col.total - 4, align: 'right' });
      rowY += rowH;
    });

    let totalsTop = rowY;
    // Ensure totals + terms always remain visible on-page
    if (totalsTop + 250 > doc.page.height - 40) {
      doc.addPage();
      doc.rect(0, 0, pageWidth, doc.page.height).fill('#ececec');
      doc.fillColor('#000000');
      totalsTop = 70;
    }
    const totalsLabelW = tableWidth - col.total;
    doc.rect(left, totalsTop, tableWidth, 66).strokeColor('#808080').lineWidth(0.8).stroke();
    doc.moveTo(left + totalsLabelW, totalsTop).lineTo(left + totalsLabelW, totalsTop + 66).stroke();
    doc.moveTo(left, totalsTop + 22).lineTo(right, totalsTop + 22).stroke();
    doc.moveTo(left, totalsTop + 44).lineTo(right, totalsTop + 44).stroke();
    doc.font('Helvetica-Bold').fontSize(10)
      .text('TOTAL', left + totalsLabelW - 70, totalsTop + 6, { width: 66, align: 'right' })
      .text('Freight', left + totalsLabelW - 70, totalsTop + 28, { width: 66, align: 'right' })
      .text('GST', left + totalsLabelW - 70, totalsTop + 50, { width: 66, align: 'right' });
    doc.text(discountedTotal.toLocaleString('en-IN'), x.total + 4, totalsTop + 6, { width: col.total - 8, align: 'right' });
    doc.font('Helvetica').text(effectiveFreight > 0 ? effectiveFreight.toLocaleString('en-IN') : '-', x.total + 4, totalsTop + 28, { width: col.total - 8, align: 'right' });
    doc.text(`${gstPercent}%`, x.total + 4, totalsTop + 50, { width: 26, align: 'left' });
    doc.font('Helvetica-Bold').text(gstAmount.toLocaleString('en-IN'), x.total + 34, totalsTop + 50, { width: col.total - 38, align: 'right' });

    doc.rect(left + totalsLabelW, totalsTop + 66, col.total, 18).strokeColor('#808080').lineWidth(0.8).stroke();
    doc.rect(left + totalsLabelW - 86, totalsTop + 66, 86, 18).strokeColor('#808080').lineWidth(0.8).stroke();
    doc.font('Helvetica-Bold').text('Grand Total', left + totalsLabelW - 82, totalsTop + 70, { width: 78, align: 'left' });
    doc.text(grandTotal.toLocaleString('en-IN'), x.total + 4, totalsTop + 70, { width: col.total - 8, align: 'right' });

    const termsTop = totalsTop + 106;
    doc.font('Helvetica-Bold').fontSize(10).text('Terms and conditions', left, termsTop - 14);
    const tRows = [
      { title: 'Prices', value: terms?.priceBasis || 'EXW TrueTorq Private Limited, Hubballi as per INCOTERM 2020' },
      { title: 'Payment Terms', value: terms?.paymentTerms || '100% Advance against PI' },
      { title: 'Taxes', value: terms?.taxesText || (terms?.taxesIncluded ? `Included in prices` : `GST extra @${gstPercent}% actual at current rate.`) },
      { title: 'Packing & Forwarding', value: terms?.packingForwarding || 'Included' },
      { title: 'Freight', value: terms?.freightText || (terms?.shippingIncluded ? 'Included in prices' : (freightAmount > 0 ? 'To pay' : 'Included')) },
      { title: 'Delivery', value: `${terms?.deliveryPeriod || '1'} ${terms?.deliveryUnit || 'week'} from the date of PO` },
    ];
    const tNoW = 45;
    const tNameW = 170;
    const tValW = tableWidth - tNoW - tNameW;
    let tY = termsTop;
    tRows.forEach((row, idx) => {
      const rH = idx === 2 ? 26 : 20;
      doc.rect(left, tY, tableWidth, rH).strokeColor('#808080').lineWidth(0.8).stroke();
      doc.moveTo(left + tNoW, tY).lineTo(left + tNoW, tY + rH).stroke();
      doc.moveTo(left + tNoW + tNameW, tY).lineTo(left + tNoW + tNameW, tY + rH).stroke();
      doc.font('Helvetica').fontSize(8.5).text(String(idx + 1), left + 2, tY + 6, { width: tNoW - 4, align: 'center' });
      doc.text(row.title, left + tNoW + 3, tY + 6, { width: tNameW - 6, align: 'left' });
      doc.text(row.value, left + tNoW + tNameW + 3, tY + 6, { width: tValW - 6, align: 'left' });
      tY += rH;
    });

    doc.font('Helvetica-Bold').fontSize(11).text('THANK YOU FOR YOUR BUSINESS!', left, tY + 12, { width: tableWidth, align: 'center' });
    doc.end();
  });

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Endpoint to create test user if it doesn't exist (for development)
app.post('/api/auth/create-test-user', async (req, res) => {
  try {
    const { email = 'admin@example.com', password = '123', role = 'admin' } = req.body;
    
    // Check if user exists
    let user = await findUserInDatabase(email);
    
    if (user) {
      return res.json({ message: 'User already exists', email: user.email });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const UserModel = getUserModel();
    user = new UserModel({
      email: email,
      password: hashedPassword,
      role: role
    });
    
    await user.save();
    
    res.json({ message: 'User created successfully', email: user.email, role: user.role });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check if user exists (for testing only)
app.get('/api/auth/debug/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('Debug: Searching for user with email:', email);
    const UserModel = getUserModel();
    console.log('Debug: Database name:', DB_NAME);
    console.log('Debug: Collection name:', UserModel.collection.name);

    const allUsers = await UserModel.find().select('email role -_id').limit(10);
    console.log('Debug: All users in database:', allUsers);

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      const userCI = await UserModel.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
      if (!userCI) {
        return res.json({ 
          found: false, 
          message: 'User not found',
          searchedEmail: email,
          database: DB_NAME,
          collection: UserModel.collection.name,
          allUsers: allUsers
        });
      }
      return res.json({ 
        found: true, 
        email: userCI.email, 
        hasPassword: !!userCI.password,
        passwordPrefix: userCI.password?.substring(0, 7),
        role: userCI.role 
      });
    }
    res.json({ 
      found: true, 
      email: user.email, 
      hasPassword: !!user.password,
      passwordPrefix: user.password?.substring(0, 7),
      role: user.role 
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email received:', email);
    console.log('Password received:', password ? '***' : 'missing');
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await findUserInDatabase(email);
    
    if (!user) {
      const sampleUsers = await getUserModel().find().select('email -_id').limit(5);
      console.log('❌ User not found. Searched for:', email);
      console.log('Sample emails in database:', sampleUsers.map(u => u.email));
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ User found:', { 
      id: user._id.toString(), 
      email: user.email, 
      hasPassword: !!user.password,
      passwordPrefix: user.password?.substring(0, 7),
      role: user.role 
    });

    // Check if password is hashed (starts with $2a$, $2b$, or $2y$) or plain text
    let isValidPassword = false;
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'))) {
      // Password is hashed, use bcrypt compare
      console.log('Comparing hashed password with bcrypt...');
      isValidPassword = await bcrypt.compare(password, user.password);
      console.log('Bcrypt comparison result:', isValidPassword);
    } else {
      // Password might be plain text (for existing users), compare directly
      console.log('Comparing plain text password...');
      isValidPassword = user.password === password;
      console.log('Plain text comparison result:', isValidPassword);
      // If match and not hashed, optionally update to hashed password
      if (isValidPassword) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        console.log('Password updated to hashed format for:', user.email);
      }
    }

    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      console.log('===================');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Ensure user has a role, default to 'user' if not set
    const userRole = user.role || 'user';

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful:', { email: user.email, role: userRole });
    console.log('===================');

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: userRole
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

// User Routes
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const users = await getUserModel().find({ role: 'user' });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { email, password, role = 'user' } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new (getUserModel())({ email: email.toLowerCase(), password: hashedPassword, role });
    await user.save();
    res.status(201).json({ _id: user._id, email: user.email, role: user.role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const update = { email: req.body.email?.toLowerCase() };
    if (req.body.password) {
      update.password = await bcrypt.hash(req.body.password, 10);
    }
    const user = await getUserModel().findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ _id: user._id, email: user.email, role: user.role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    await getUserModel().findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Employee Routes
app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const employees = await getUserModel().find({ role: 'employee' });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/employees', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { email, password, role = 'employee' } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = new (getUserModel())({ email: email.toLowerCase(), password: hashedPassword, role });
    await employee.save();
    res.status(201).json({ _id: employee._id, email: employee.email, role: employee.role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const update = { email: req.body.email?.toLowerCase() };
    if (req.body.password) {
      update.password = await bcrypt.hash(req.body.password, 10);
    }
    const employee = await getUserModel().findByIdAndUpdate(req.params.id, update, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ _id: employee._id, email: employee.email, role: employee.role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    await getUserModel().findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Product Routes
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const products = await getProductModel().find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const product = new (getProductModel())(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const product = await getProductModel().findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    await getProductModel().findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lead Routes
app.post('/api/leads', requireDb, async (req, res) => {
  try {
    const {
      productName,
      requesterEmail,
      contactNumber,
      quantity,
      quantityRequested,
      items,
      quotationFor,
    } = req.body;

    if (!productName || !requesterEmail) {
      return res.status(400).json({ message: 'productName and requesterEmail are required' });
    }

    const leadPayload = {
      productName,
      requesterEmail: requesterEmail.toLowerCase(),
      contactNumber: contactNumber || '',
      quotationFor: quotationFor ? {
        company: quotationFor.company || '',
        name: quotationFor.name || '',
        location: quotationFor.location || '',
        kindAttn: quotationFor.kindAttn || '',
        phone: quotationFor.phone || contactNumber || '',
        email: quotationFor.email || requesterEmail || '',
        reference: quotationFor.reference || '',
      } : undefined,
      quantity: Number(quantity) > 0 ? Number(quantity) : 1,
      quantityRequested: Number(quantityRequested) > 0 ? Number(quantityRequested) : undefined,
      status: 'pending',
      items: Array.isArray(items) ? items : undefined,
    };

    const LeadModel = getLeadModel();
    const lead = new LeadModel(leadPayload);
    await lead.save();

    res.status(201).json(lead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/leads', authenticateToken, async (req, res) => {
  try {
    // If employee, filter by assignedEmployee
    const isEmployee = req.user.role?.toLowerCase() === 'employee';
    const employeeEmail = isEmployee ? req.user.email : null;
    
    const LeadModel = getLeadModel();
    let leads;
    if (isEmployee && employeeEmail) {
      leads = await LeadModel.find({
        assignedEmployee: { $regex: new RegExp(employeeEmail, 'i') },
      });
    } else {
      leads = await LeadModel.find();
    }
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/leads/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { assignedEmployee, comment } = req.body;
    
    const LeadModel = getLeadModel();
    const lead = await LeadModel.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    
    // Set both assignedTo and assignedEmployee for compatibility
    lead.assignedTo = assignedEmployee;
    lead.assignedEmployee = assignedEmployee;
    lead.status = 'assigned';
    
    if (comment) {
      if (!lead.comments) {
        lead.comments = [];
      }
      lead.comments.push({
        comment,
        authorType: req.user.role === 'admin' ? 'admin' : 'employee',
        createdAt: new Date()
      });
    }
    
    await lead.save();
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/leads/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const result = await getLeadModel().findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Quotation Routes - Generate PDF from lead quotation data
app.get('/api/quotation/:id', authenticateToken, async (req, res) => {
  try {
    const leadId = req.params.id;
    const lead = await resolveLead(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const QuotationModel = getQuotationModel();
    const savedQuotation = await QuotationModel.findOne({ leadId });

    if (savedQuotation?.pdf && savedQuotation.pdf.length > 0) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="quotation-${leadId}.pdf"`);
      return res.send(savedQuotation.pdf);
    }

    if (!lead.quotation) {
      return res.status(404).json({ message: 'Quotation data not found for this lead' });
    }
    
    // Generate professional PDF quotation
    const doc = new PDFDocument({ 
      size: 'A4',
      margin: 40,
      info: {
        Title: `Quotation - ${lead.productName || 'Product'}`,
        Author: 'TrueTorq',
        Subject: 'Quotation Document'
      }
    });
    
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="quotation-${leadId}.pdf"`);
      res.send(pdfData);
    });
    
    // Colors
    const primaryColor = '#30578e';
    const darkColor = '#000000';
    const lightGray = '#f5f5f5';
    
    // Page dimensions
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 40;
    const bottomMargin = 60; // Space for footer
    const maxContentHeight = pageHeight - margin - bottomMargin;
    
    // Helper function to check if we need a new page
    const checkPageBreak = (requiredHeight) => {
      const currentY = doc.y;
      if (currentY + requiredHeight > maxContentHeight) {
        doc.addPage();
        return margin; // Return new Y position
      }
      return currentY; // Return current Y position
    };
    
    // Helper function to draw a rectangle
    const drawRect = (x, y, width, height, color) => {
      doc.rect(x, y, width, height).fill(color);
    };
    
    // Helper function to draw a line
    const drawLine = (x1, y1, x2, y2, width = 1, color = darkColor) => {
      doc.moveTo(x1, y1).lineTo(x2, y2).strokeColor(color).lineWidth(width).stroke();
    };
    
    // Header Section with Logo Area
    const headerHeight = 120;
    drawRect(40, 40, 515, headerHeight, primaryColor);
    
    // Company Logo Area (placeholder - you can replace with actual logo)
    doc.fillColor('#ffffff')
       .fontSize(32)
       .font('Helvetica-Bold')
       .text('TT', 60, 60, { width: 80, align: 'left' });
    
    doc.fillColor('#ffffff')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('TrueTorq', 60, 95, { width: 200, align: 'left' });
    
    doc.fillColor('#ffffff')
       .fontSize(10)
       .font('Helvetica')
       .text('Together We Move', 60, 115, { width: 200, align: 'left' });
    
    // Quotation Title
    doc.fillColor('#ffffff')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('QUOTATION', 350, 70, { width: 200, align: 'right' });
    
    // Quotation Number and Date
    const quotationNumber = `QT-${leadId.toString().substring(0, 8).toUpperCase()}`;
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    doc.fillColor('#ffffff')
       .fontSize(9)
       .font('Helvetica')
       .text(`Quotation #: ${quotationNumber}`, 350, 100, { width: 200, align: 'right' });
    
    doc.fillColor('#ffffff')
       .fontSize(9)
       .font('Helvetica')
       .text(`Date: ${currentDate}`, 350, 115, { width: 200, align: 'right' });
    
    let yPosition = 180;
    
    // Company Information Section
    doc.fillColor(darkColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('From:', 40, yPosition);
    
    doc.fillColor(darkColor)
       .fontSize(10)
       .font('Helvetica')
       .text('TrueTorq Industries', 40, yPosition + 20, { width: 250 });
    doc.text('123 Industrial Park', 40, yPosition + 35, { width: 250 });
    doc.text('Mumbai, Maharashtra 400001', 40, yPosition + 50, { width: 250 });
    doc.text('India', 40, yPosition + 65, { width: 250 });
    doc.text('Email: info@truetorq.com', 40, yPosition + 80, { width: 250 });
    doc.text('Phone: +91 22 1234 5678', 40, yPosition + 95, { width: 250 });
    
    // Bill To Section
    doc.fillColor(darkColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Bill To:', 320, yPosition);
    
    const billToY = yPosition + 20;
    doc.fillColor(darkColor)
       .fontSize(10)
       .font('Helvetica')
       .text(lead.requesterEmail || 'N/A', 320, billToY, { width: 235 });
    
    if (lead.contactNumber) {
      doc.text(`Phone: ${lead.contactNumber}`, 320, billToY + 20, { width: 235 });
    }
    
    if (lead.quotation?.verify) {
      const verify = lead.quotation.verify;
      if (verify.addressLine1) {
        doc.text(verify.addressLine1, 320, billToY + 40, { width: 235 });
        if (verify.addressLine2) {
          doc.text(verify.addressLine2, 320, billToY + 55, { width: 235 });
        }
      }
    }
    
    yPosition = 350;
    
    // Products Section
    if (lead.quotation?.products && Array.isArray(lead.quotation.products) && lead.quotation.products.length > 0) {
      // Section Header
      drawRect(40, yPosition, 515, 30, lightGray);
      doc.fillColor(darkColor)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('PRODUCTS & SERVICES', 50, yPosition + 8);
      
      yPosition += 40;
      
      let totalAmount = 0;
      const currency = lead.quotation.currency || '$';
      
      // Table Header
      drawRect(40, yPosition, 515, 25, primaryColor);
      doc.fillColor('#ffffff')
         .fontSize(10)
         .font('Helvetica-Bold')
         .text('Image', 50, yPosition + 7, { width: 60, align: 'center' });
      doc.text('Product', 120, yPosition + 7, { width: 200 });
      doc.text('Qty', 330, yPosition + 7, { width: 50, align: 'center' });
      doc.text('Unit Price', 390, yPosition + 7, { width: 70, align: 'right' });
      doc.text('Total', 470, yPosition + 7, { width: 75, align: 'right' });
      
      yPosition += 30;
      
      // Product Rows
      lead.quotation.products.forEach((product, index) => {
        const rowHeight = 80;
        const isEven = index % 2 === 0;
        
        // Row background
        if (isEven) {
          drawRect(40, yPosition, 515, rowHeight, '#fafafa');
        }
        
        // Product Image Placeholder (using placeholder image service)
        const imageSize = 60;
        const imageX = 50;
        const imageY = yPosition + 10;
        
        // Draw image placeholder box
        doc.rect(imageX, imageY, imageSize, imageSize)
           .strokeColor('#cccccc')
           .lineWidth(1)
           .stroke();
        
        // Add placeholder image URL text (in real implementation, you'd load actual image)
        doc.fillColor('#999999')
           .fontSize(7)
           .font('Helvetica')
           .text('IMG', imageX + 15, imageY + 25, { width: 30, align: 'center' });
        
        // Product Details
        const productX = 120;
        // Try multiple possible field names for product name
        const productName = product.productName || 
                           product.name || 
                           product.product || 
                           product.title ||
                           `Product ${index + 1}`;
        doc.fillColor(darkColor)
           .fontSize(11)
           .font('Helvetica-Bold')
           .text(productName, productX, yPosition + 10, { width: 200 });
        
        if (product.description) {
          doc.fillColor('#666666')
             .fontSize(9)
             .font('Helvetica')
             .text(product.description.substring(0, 80) + (product.description.length > 80 ? '...' : ''), 
                   productX, yPosition + 30, { width: 200 });
        }
        
        // Quantity
        const qty = product.quantity || 1;
        doc.fillColor(darkColor)
           .fontSize(10)
           .font('Helvetica')
           .text(String(qty), 330, yPosition + 35, { width: 50, align: 'center' });
        
        // Unit Price
        const unitPrice = product.price || 0;
        doc.fillColor(darkColor)
           .fontSize(10)
           .font('Helvetica')
           .text(`${currency}${unitPrice.toFixed(2)}`, 390, yPosition + 35, { width: 70, align: 'right' });
        
        // Total
        const rowTotal = unitPrice * qty;
        totalAmount += rowTotal;
        doc.fillColor(darkColor)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(`${currency}${rowTotal.toFixed(2)}`, 470, yPosition + 35, { width: 75, align: 'right' });
        
        // Row separator
        drawLine(40, yPosition + rowHeight, 555, yPosition + rowHeight, 0.5, '#e0e0e0');
        
        yPosition += rowHeight;
      });
      
      yPosition += 20;
      
      // Totals Section
      const totalsX = 390;
      const totalsWidth = 165;
      
      // Subtotal
      doc.fillColor(darkColor)
         .fontSize(10)
         .font('Helvetica')
         .text('Subtotal:', totalsX, yPosition, { width: 80, align: 'right' });
      doc.fillColor(darkColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(`${currency}${totalAmount.toFixed(2)}`, totalsX + 85, yPosition, { width: 80, align: 'right' });
      
      // Calculate all values first before displaying
      // Discount - Check multiple possible locations in quotation data
      const discountAmount = parseFloat(lead.quotation?.discount || 
                            lead.quotation?.discountAmount || 
                            lead.quotation?.terms?.discount || 
                            0) || 0;
      const discountPercent = parseFloat(lead.quotation?.discountPercent || 
                             lead.quotation?.terms?.discountPercent || 
                             0) || 0;
      let discountValue = 0;
      
      // Calculate discount value - ensure it's always a number
      if (discountPercent > 0 && !isNaN(discountPercent)) {
        discountValue = parseFloat((totalAmount * (discountPercent / 100)).toFixed(2)) || 0;
      } else if (discountAmount > 0 && !isNaN(discountAmount)) {
        discountValue = parseFloat(discountAmount.toFixed(2)) || 0;
      }
      
      // Ensure discountValue is always a number
      discountValue = parseFloat(discountValue) || 0;
      
      // Calculate subtotal after discount
      const subtotalAfterDiscount = parseFloat((totalAmount - discountValue).toFixed(2)) || 0;
      
      // Tax calculation (on discounted amount)
      const taxRate = 0.18; // 18% GST
      const taxAmount = parseFloat((subtotalAfterDiscount * taxRate).toFixed(2)) || 0;
      
      // Shipping Charges
      const shippingCharges = parseFloat(lead.quotation?.shippingCharges || 
                             lead.quotation?.shipping || 
                             lead.quotation?.terms?.shippingCharges || 
                             0) || 0;
      
      // Totals section with proper spacing - Add space before totals
      yPosition += 15;
      
      // Draw a separator line before totals
      drawLine(totalsX - 10, yPosition, totalsX + totalsWidth + 10, yPosition, 1, '#e0e0e0');
      yPosition += 20;
      
      // Subtotal
      doc.fillColor(darkColor)
         .fontSize(10)
         .font('Helvetica')
         .text('Subtotal:', totalsX, yPosition, { width: 80, align: 'right' });
      doc.fillColor(darkColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(`${currency}${totalAmount.toFixed(2)}`, totalsX + 85, yPosition, { width: 80, align: 'right' });
      yPosition += 22;
      
      // Discount - Show only if there's a discount
      if (discountPercent > 0 || discountAmount > 0) {
        if (discountPercent > 0) {
          doc.fillColor(darkColor)
             .fontSize(10)
             .font('Helvetica')
             .text(`Discount (${discountPercent}%):`, totalsX, yPosition, { width: 80, align: 'right' });
        } else {
          doc.fillColor(darkColor)
             .fontSize(10)
             .font('Helvetica')
             .text('Discount:', totalsX, yPosition, { width: 80, align: 'right' });
        }
        doc.fillColor('#006600')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(`-${currency}${discountValue.toFixed(2)}`, totalsX + 85, yPosition, { width: 80, align: 'right' });
        yPosition += 22;
        
        // Subtotal after discount
        doc.fillColor(darkColor)
           .fontSize(10)
           .font('Helvetica')
           .text('Subtotal (after discount):', totalsX, yPosition, { width: 80, align: 'right' });
        doc.fillColor(darkColor)
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(`${currency}${subtotalAfterDiscount.toFixed(2)}`, totalsX + 85, yPosition, { width: 80, align: 'right' });
        yPosition += 22;
      }
      
      // Tax (18% GST)
      doc.fillColor(darkColor)
         .fontSize(10)
         .font('Helvetica')
         .text('Tax (18% GST):', totalsX, yPosition, { width: 80, align: 'right' });
      doc.fillColor(darkColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(`${currency}${taxAmount.toFixed(2)}`, totalsX + 85, yPosition, { width: 80, align: 'right' });
      yPosition += 22;
      
      // Shipping Charges - Always show
      doc.fillColor(darkColor)
         .fontSize(10)
         .font('Helvetica')
         .text('Shipping Charges:', totalsX, yPosition, { width: 80, align: 'right' });
      doc.fillColor(darkColor)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text(`${currency}${shippingCharges.toFixed(2)}`, totalsX + 85, yPosition, { width: 80, align: 'right' });
      yPosition += 22;
      
      // Grand Total - Always include discount and shipping
      // Ensure all values are numbers
      const grandTotal = parseFloat((subtotalAfterDiscount + taxAmount + shippingCharges).toFixed(2)) || 0;
      
      // Add spacing before grand total
      yPosition += 5;
      drawRect(totalsX, yPosition - 5, totalsWidth, 35, primaryColor);
      doc.fillColor('#ffffff')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Grand Total:', totalsX, yPosition + 8, { width: 80, align: 'right' });
      doc.fillColor('#ffffff')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(`${currency}${grandTotal.toFixed(2)}`, totalsX + 85, yPosition + 6, { width: 80, align: 'right' });
      
      yPosition += 45;
    }
    
    // Terms & Conditions Section - Only deliveryPeriod and paymentTerms
    // Check if we need a new page for terms section
    const termsSectionHeight = 120; // Approximate height needed for terms section
    yPosition = checkPageBreak(termsSectionHeight);
    
    // Section Header with better styling
    const termsHeaderHeight = 28;
    drawRect(40, yPosition, 515, termsHeaderHeight, primaryColor);
    doc.fillColor('#ffffff')
       .fontSize(13)
       .font('Helvetica-Bold')
       .text('TERMS & CONDITIONS', 50, yPosition + 8);
    
    yPosition += termsHeaderHeight + 10;
    
    // Terms content box with border
    const termsBoxY = yPosition;
    const termsBoxHeight = 70; // Fixed height for 2 terms
    
    // Draw terms container with border
    doc.rect(40, termsBoxY, 515, termsBoxHeight)
       .strokeColor('#e0e0e0')
       .lineWidth(1.5)
       .stroke();
    
    // Light background
    drawRect(40, termsBoxY, 515, termsBoxHeight, '#fafafa');
    
    // Terms content - Only deliveryPeriod and paymentTerms
    let termsY = termsBoxY + 15;
    const lineHeight = 20;
    const maxWidth = 495;
    const leftPadding = 50;
    
    doc.fillColor(darkColor)
       .fontSize(9)
       .font('Helvetica');
    
    // Get only deliveryPeriod and paymentTerms from quotation
    const quotation = lead.quotation || {};
    const terms = quotation.terms || {};
    
    // Payment Terms
    const paymentTerms = terms.paymentTerms || quotation.paymentTerms || '50% advance payment required, balance on delivery.';
    doc.circle(leftPadding + 5, termsY + 3, 2)
       .fillColor(primaryColor)
       .fill();
    doc.fillColor(darkColor)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('1. Payment Terms:', leftPadding + 12, termsY, { width: 120 });
    doc.fillColor(darkColor)
       .fontSize(9)
       .font('Helvetica')
       .text(paymentTerms, leftPadding + 130, termsY, { width: maxWidth - 140 });
    
    termsY += lineHeight + 5;
    
    // Delivery Period
    const deliveryPeriod = terms.deliveryPeriod || quotation.deliveryPeriod || 'Standard delivery within 15-20 business days from order confirmation.';
    doc.circle(leftPadding + 5, termsY + 3, 2)
       .fillColor(primaryColor)
       .fill();
    doc.fillColor(darkColor)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('2. Delivery Period:', leftPadding + 12, termsY, { width: 120 });
    doc.fillColor(darkColor)
       .fontSize(9)
       .font('Helvetica')
       .text(deliveryPeriod, leftPadding + 130, termsY, { width: maxWidth - 140 });
    
    // Update yPosition for footer
    yPosition = termsBoxY + termsBoxHeight + 15;
    
    // Footer - Always on the last page, check if we need a new page
    const footerHeight = 50;
    if (yPosition + footerHeight > maxContentHeight) {
      doc.addPage();
      yPosition = margin;
    }
    
    const footerY = yPosition;
    drawLine(40, footerY, 555, footerY, 1, '#cccccc');
    
    doc.fillColor('#666666')
       .fontSize(8)
       .font('Helvetica')
       .text('Thank you for your business!', 40, footerY + 10, { width: 515, align: 'center' });
    
    doc.fillColor('#999999')
       .fontSize(7)
       .font('Helvetica')
       .text(`This is a computer-generated document. Generated on ${new Date().toLocaleString()}`, 
             40, footerY + 25, { width: 515, align: 'center' });
    
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/quotation/:id/data', authenticateToken, async (req, res) => {
  try {
    const lead = await resolveLead(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    const QuotationModel = getQuotationModel();
    const quotation = await QuotationModel.findOne({ leadId: req.params.id });
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json({
      products: quotation.products,
      terms: quotation.terms,
      verify: quotation.verify,
      currency: quotation.currency
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/quotation/generate', authenticateToken, async (req, res) => {
  try {
    const { leadId, products, terms, verify, currency } = req.body;
    const loggedInUser = req.user?.email ? await findUserInDatabase(req.user.email) : null;
    const preparedByName = loggedInUser?.name || req.user?.email || 'sales@truetorq.com';

    const lead = await resolveLead(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const mergedVerify = {
      ...(lead?.quotationFor ? {
        companyName: lead.quotationFor.company,
        customerName: lead.quotationFor.name,
        location: lead.quotationFor.location,
        kindAttn: lead.quotationFor.kindAttn,
        pnsPhone: lead.quotationFor.phone,
        reference: lead.quotationFor.reference,
      } : {}),
      ...(verify || {}),
      preparedBy: preparedByName,
    };

    const pdfContent = await buildQuotationPdfBuffer({ lead, products, terms, verify: mergedVerify, currency });
    const QuotationModel = getQuotationModel();
    const LeadModel = getLeadModel();

    let quotation = await QuotationModel.findOne({ leadId });
    if (quotation) {
      quotation.products = products;
      quotation.terms = terms;
      quotation.verify = mergedVerify;
      quotation.currency = currency;
      quotation.pdf = pdfContent;
    } else {
      quotation = new QuotationModel({
        leadId,
        products,
        terms,
        verify: mergedVerify,
        currency,
        pdf: pdfContent
      });
    }
    await quotation.save();
    
    // Update lead status
    await LeadModel.findByIdAndUpdate(leadId, {
      status: 'completed',
      quotation: {
        products,
        terms,
        verify: mergedVerify,
        currency,
        generatedAt: new Date(),
        exists: true
      }
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfContent);
  } catch (error) {
    console.error('Quotation generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/quotation/send', authenticateToken, async (req, res) => {
  try {
    const { leadId, requesterEmail } = req.body;
    
    // In production, you'd send an email here
    // For now, just return success
    res.json({ message: 'Quotation sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const dbConnected = isDbConnected();
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'ok' : 'degraded',
    message: dbConnected ? 'Server is running' : 'Server up but database not connected',
    database: dbConnected ? mongoose.connection.name || DB_NAME : null,
  });
});

const startServer = async () => {
  try {
    await connectMongo();
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.error('   API routes that need the database will return 503 until MongoDB is reachable.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Backend server running on http://0.0.0.0:${PORT}`);
    console.log(`✅ Backend accessible on http://localhost:${PORT}`);
    console.log(`📊 MongoDB: ${isDbConnected() ? `Connected (${mongoose.connection.name || DB_NAME})` : 'Not connected'}`);
  });
};

startServer();

