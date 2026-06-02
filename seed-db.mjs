import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGO_URI =
  process.env.SEED_MONGO_URI ||
  'mongodb+srv://user:user@truetorq.qitevte.mongodb.net/?appName=TrueTorq';
const DB_NAME = process.env.SEED_DB_NAME || 'protorq';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee', 'user'] },
  },
  { timestamps: true, collection: 'users', strict: false }
);

const LeadSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    requesterEmail: { type: String, required: true },
    contactNumber: { type: String },
    quantity: { type: Number, default: 1 },
    quantityRequested: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in-progress', 'completed'],
      default: 'pending',
    },
    assignedTo: { type: String },
    assignedEmployee: { type: String },
    quotation: { type: mongoose.Schema.Types.Mixed },
    comments: [
      {
        comment: String,
        authorType: { type: String, enum: ['admin', 'employee'] },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, collection: 'leads', strict: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
  },
  { timestamps: true, collection: 'products' }
);

const QuotationSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    products: [mongoose.Schema.Types.Mixed],
    terms: mongoose.Schema.Types.Mixed,
    verify: mongoose.Schema.Types.Mixed,
    currency: { type: String },
    pdf: { type: Buffer },
  },
  { timestamps: true, collection: 'quotations' }
);

const User = mongoose.model('SeedUser', UserSchema, 'users');
const Lead = mongoose.model('SeedLead', LeadSchema, 'leads');
const Product = mongoose.model('SeedProduct', ProductSchema, 'products');
const Quotation = mongoose.model('SeedQuotation', QuotationSchema, 'quotations');

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function run() {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 15000 });
  console.log(`Connected to ${DB_NAME}`);

  const hashed = await bcrypt.hash('123456', 10);
  const now = Date.now();

  const users = [
    { email: `admin.seed.${now}@truetorq.local`, password: hashed, role: 'admin' },
    { email: `employee.seed.${now}@truetorq.local`, password: hashed, role: 'employee' },
    { email: `user.seed.${now}@truetorq.local`, password: hashed, role: 'user' },
  ];
  const insertedUsers = await User.insertMany(users);

  const products = [
    {
      name: `Jaw Coupling ${randomInt(100, 999)}`,
      description: 'Flexible jaw coupling for industrial drives',
      price: randomInt(1500, 4500),
      category: 'Power Transmission',
    },
    {
      name: `Gear Coupling ${randomInt(100, 999)}`,
      description: 'High torque gear coupling',
      price: randomInt(2500, 6500),
      category: 'Heavy Duty',
    },
    {
      name: `Pin Bush Coupling ${randomInt(100, 999)}`,
      description: 'Vibration damping pin bush coupling',
      price: randomInt(1200, 3200),
      category: 'General Purpose',
    },
  ];
  const insertedProducts = await Product.insertMany(products);

  const leadDocs = [
    {
      productName: insertedProducts[0].name,
      requesterEmail: insertedUsers[2].email,
      contactNumber: `98${randomInt(10000000, 99999999)}`,
      quantity: randomInt(1, 10),
      quantityRequested: randomInt(1, 10),
      status: 'pending',
      comments: [{ comment: 'Initial inquiry', authorType: 'admin', createdAt: new Date() }],
    },
    {
      productName: insertedProducts[1].name,
      requesterEmail: insertedUsers[2].email,
      contactNumber: `97${randomInt(10000000, 99999999)}`,
      quantity: randomInt(5, 20),
      quantityRequested: randomInt(5, 20),
      status: 'assigned',
      assignedTo: insertedUsers[1].email,
      assignedEmployee: insertedUsers[1].email,
      comments: [{ comment: 'Assigned to employee', authorType: 'admin', createdAt: new Date() }],
    },
    {
      productName: insertedProducts[2].name,
      requesterEmail: insertedUsers[2].email,
      contactNumber: `96${randomInt(10000000, 99999999)}`,
      quantity: randomInt(2, 8),
      quantityRequested: randomInt(2, 8),
      status: 'completed',
      assignedTo: insertedUsers[1].email,
      assignedEmployee: insertedUsers[1].email,
      quotation: {
        currency: 'INR',
        products: [
          {
            productName: insertedProducts[2].name,
            description: insertedProducts[2].description,
            quantity: 3,
            price: insertedProducts[2].price,
          },
        ],
        terms: {
          paymentTerms: '50% advance, 50% before dispatch',
          deliveryPeriod: '10-15 working days',
          discountPercent: 5,
          shippingCharges: 750,
        },
        verify: {
          companyName: 'Sample Industries Pvt Ltd',
          contactPerson: 'Arun Kumar',
          addressLine1: 'Plot 12, MIDC Area',
          addressLine2: 'Pune, Maharashtra',
          gstNumber: '27ABCDE1234F1Z5',
        },
      },
      comments: [{ comment: 'Quotation finalized', authorType: 'employee', createdAt: new Date() }],
    },
  ];
  const insertedLeads = await Lead.insertMany(leadDocs);

  const quotationDocs = [
    {
      leadId: insertedLeads[2]._id,
      products: insertedLeads[2].quotation.products,
      terms: insertedLeads[2].quotation.terms,
      verify: insertedLeads[2].quotation.verify,
      currency: 'INR',
      pdf: Buffer.from('seed-pdf-placeholder'),
    },
  ];
  const insertedQuotations = await Quotation.insertMany(quotationDocs);

  const [userCount, productCount, leadCount, quotationCount] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Lead.countDocuments(),
    Quotation.countDocuments(),
  ]);

  console.log('Seed complete:');
  console.log({
    inserted: {
      users: insertedUsers.length,
      products: insertedProducts.length,
      leads: insertedLeads.length,
      quotations: insertedQuotations.length,
    },
    totals: { userCount, productCount, leadCount, quotationCount },
    sampleCredentials: {
      adminEmail: insertedUsers[0].email,
      employeeEmail: insertedUsers[1].email,
      userEmail: insertedUsers[2].email,
      password: '123456',
    },
  });

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error('Seeding failed:', err.message);
  try {
    await mongoose.disconnect();
  } catch {
    // Ignore disconnect errors after failed connect
  }
  process.exit(1);
});
