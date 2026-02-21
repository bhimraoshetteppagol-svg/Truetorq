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

// MongoDB Connection - Connect without database first to find the right one
const MONGODB_BASE_URI = 'mongodb+srv://admin:admin@evolutionapi.ipbubyl.mongodb.net/?appName=EvolutionAPI';

mongoose.connect(MONGODB_BASE_URI, {
  serverSelectionTimeoutMS: 10000,
}).then(async () => {
  console.log('✅ Successfully connected to MongoDB');
  
  // List all databases
  const adminDb = mongoose.connection.db.admin();
  const dbs = await adminDb.listDatabases();
  console.log('📁 Available databases:', dbs.databases.map(db => db.name));
  
  // Find database with users collection containing admin@example.com
  let targetDb = null;
  let targetDbName = null;
  
  for (const dbInfo of dbs.databases) {
    const db = mongoose.connection.useDb(dbInfo.name);
    const collections = await db.listCollections().toArray();
    const hasUsersCollection = collections.find(c => c.name === 'users');
    
    if (hasUsersCollection) {
      const userCount = await db.collection('users').countDocuments();
      if (userCount > 0) {
        const user = await db.collection('users').findOne({ email: 'admin@example.com' });
        if (user) {
          targetDb = db;
          targetDbName = dbInfo.name;
          console.log(`✅ Found user in database: ${dbInfo.name}`);
          break;
        }
      }
    }
  }
  
  // If not found, try common database names
  if (!targetDb) {
    const possibleNames = ['protorq', 'Protorq', 'protoq', 'Protoq', 'ProtorQ'];
    for (const dbName of possibleNames) {
      try {
        const db = mongoose.connection.useDb(dbName);
        const user = await db.collection('users').findOne({ email: 'admin@example.com' });
        if (user) {
          targetDb = db;
          targetDbName = dbName;
          console.log(`✅ Found user in database: ${dbName}`);
          break;
        }
      } catch (e) {
        // Database doesn't exist, continue
      }
    }
  }
  
  // Default to protorq if not found
  if (!targetDb) {
    targetDbName = 'protorq';
    targetDb = mongoose.connection.useDb(targetDbName);
    console.log(`📁 Using default database: ${targetDbName}`);
  } else {
    mongoose.connection.useDb(targetDbName);
    console.log(`📁 Using database: ${targetDbName}`);
  }
  
  // Check users and leads collections
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('📋 Available collections:', collections.map(c => c.name));
  
  if (collections.find(c => c.name === 'users')) {
    const userCount = await db.collection('users').countDocuments();
    console.log('👥 Users collection document count:', userCount);
    
    if (userCount > 0) {
      const sampleUsers = await db.collection('users').find({}).limit(3).toArray();
      console.log('📝 Sample user emails:', sampleUsers.map(u => u.email));
    }
  }
  
  // Check leads collection
  if (collections.find(c => c.name === 'leads')) {
    const leadCount = await db.collection('leads').countDocuments();
    console.log('📊 Leads collection document count:', leadCount);
    
    if (leadCount > 0) {
      const sampleLeads = await db.collection('leads').find({}).limit(3).toArray();
      console.log('📝 Sample leads:', sampleLeads.map(l => ({ 
        id: l._id, 
        product: l.productName, 
        email: l.requesterEmail,
        status: l.status 
      })));
    }
  } else {
    console.log('⚠️  Leads collection is empty or does not exist');
  }
}).catch((error) => {
  console.error('❌ Error connecting to MongoDB:', error);
});

// Schemas - User schema for existing users collection
// Note: We'll use the database selected in the connection
const UserSchema = new mongoose.Schema({
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
}, { timestamps: true });

// Create User model - will use the database from the connection
const User = mongoose.model('User', UserSchema);

// Helper function to find user across databases
const findUserInDatabase = async (email, dbName = null) => {
  // Try common database names in order of preference
  const possibleDbs = dbName ? [dbName] : ['protorq', 'Protorq', 'protoq', 'Protoq', 'test'];
  
  for (const db of possibleDbs) {
    try {
      const dbConnection = mongoose.connection.useDb(db);
      const UserModel = dbConnection.model('User', UserSchema, 'users');
      
      // Try exact match
      let user = await UserModel.findOne({ email: email });
      if (user) {
        // Switch to this database for future queries
        mongoose.connection.useDb(db);
        return user;
      }
      
      // Try case-insensitive
      user = await UserModel.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
      if (user) {
        mongoose.connection.useDb(db);
        return user;
      }
      
      // Try lowercase
      user = await UserModel.findOne({ email: email.toLowerCase() });
      if (user) {
        mongoose.connection.useDb(db);
        return user;
      }
    } catch (e) {
      // Database doesn't exist or error, continue
      console.log(`Database ${db} not accessible:`, e.message);
    }
  }
  return null;
};
// Helper function to get Lead model from the correct database
const getLeadModel = (dbName = 'protorq') => {
  const db = mongoose.connection.useDb(dbName);
  return db.model('Lead', LeadSchema, 'leads');
};

// Helper function to get Product model from the correct database
const getProductModel = (dbName = 'protorq') => {
  const db = mongoose.connection.useDb(dbName);
  return db.model('Product', ProductSchema, 'products');
};

// Helper function to find leads across databases
const findLeadsInDatabase = async (dbName = null) => {
  const possibleDbs = dbName ? [dbName] : ['protorq', 'Protorq', 'protoq', 'Protoq', 'test'];
  let allLeads = [];
  
  for (const db of possibleDbs) {
    try {
      const LeadModel = getLeadModel(db);
      const leads = await LeadModel.find();
      if (leads.length > 0) {
        allLeads = [...allLeads, ...leads];
        // If we found leads, prefer this database for future queries
        mongoose.connection.useDb(db);
        console.log(`Found ${leads.length} leads in database: ${db}`);
      }
    } catch (e) {
      // Database doesn't exist or error, continue
      console.log(`Database ${db} not accessible for leads:`, e.message);
    }
  }
  
  return allLeads;
};

const Lead = mongoose.model('Lead', LeadSchema);
const Product = mongoose.model('Product', ProductSchema);
const Quotation = mongoose.model('Quotation', QuotationSchema);

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
    
    // Create user in protorq database
    const db = mongoose.connection.useDb('protorq');
    const UserModel = db.model('User', UserSchema, 'users');
    
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
    console.log('Debug: Database name:', mongoose.connection.db?.databaseName);
    console.log('Debug: Collection name:', User.collection.name);
    
    // List all users first
    const allUsers = await User.find().select('email role -_id').limit(10);
    console.log('Debug: All users in database:', allUsers);
    
    const user = await User.findOne({ email: email });
    if (!user) {
      // Try case-insensitive
      const userCI = await User.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
      if (!userCI) {
        return res.json({ 
          found: false, 
          message: 'User not found',
          searchedEmail: email,
          database: mongoose.connection.db?.databaseName,
          collection: User.collection.name,
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

    // Find user in the existing users collection - search across all databases
    let user = await findUserInDatabase(email);
    
    if (!user) {
      // Debug: show sample emails in database
      const sampleUsers = await User.find().select('email -_id').limit(5);
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
    
    // Try to find users in the protorq database first
    let users = [];
    const possibleDbs = ['protorq', 'Protorq', 'protoq', 'Protoq', 'test'];
    
    for (const db of possibleDbs) {
      try {
        const dbConnection = mongoose.connection.useDb(db);
        const UserModel = dbConnection.model('User', UserSchema, 'users');
        users = await UserModel.find({ role: 'user' });
        if (users.length > 0) {
          console.log(`Found ${users.length} users with role 'user' in ${db} database`);
          mongoose.connection.useDb(db);
          break;
        }
      } catch (e) {
        console.log(`Database ${db} not accessible for users:`, e.message);
      }
    }
    
    // If no users found, try current database
    if (users.length === 0) {
      try {
        users = await User.find({ role: 'user' });
        console.log(`Found ${users.length} users with role 'user' in current database`);
      } catch (e) {
        console.log('Error fetching users from current database:', e.message);
      }
    }
    
    console.log(`Total users with role 'user' found: ${users.length}`);
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
    const user = new User({ email: email.toLowerCase(), password: hashedPassword, role });
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
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
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
    await User.findByIdAndDelete(req.params.id);
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
    
    // Try to find employees in the protorq database first
    let employees = [];
    const possibleDbs = ['protorq', 'Protorq', 'protoq', 'Protoq', 'test'];
    
    for (const db of possibleDbs) {
      try {
        const dbConnection = mongoose.connection.useDb(db);
        const UserModel = dbConnection.model('User', UserSchema, 'users');
        employees = await UserModel.find({ role: 'employee' });
        if (employees.length > 0) {
          console.log(`Found ${employees.length} employees in ${db} database`);
          mongoose.connection.useDb(db);
          break;
        }
      } catch (e) {
        console.log(`Database ${db} not accessible for employees:`, e.message);
      }
    }
    
    // If no employees found, try current database
    if (employees.length === 0) {
      try {
        employees = await User.find({ role: 'employee' });
        console.log(`Found ${employees.length} employees in current database`);
      } catch (e) {
        console.log('Error fetching employees from current database:', e.message);
      }
    }
    
    console.log(`Total employees found: ${employees.length}`);
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
    const employee = new User({ email: email.toLowerCase(), password: hashedPassword, role });
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
    const employee = await User.findByIdAndUpdate(req.params.id, update, { new: true });
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
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Product Routes
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    // Try to find products in the protorq database first
    let products = [];
    const possibleDbs = ['protorq', 'Protorq', 'protoq', 'Protoq', 'test'];
    
    // Try protorq database first (most likely)
    try {
      const ProductModel = getProductModel('protorq');
      products = await ProductModel.find();
      console.log(`Found ${products.length} products in protorq database`);
      if (products.length > 0) {
        mongoose.connection.useDb('protorq');
      }
    } catch (e) {
      console.log('protorq database not accessible for products, trying other databases...');
    }
    
    // If no products found, search across all databases
    if (products.length === 0) {
      for (const db of possibleDbs) {
        try {
          const ProductModel = getProductModel(db);
          const dbProducts = await ProductModel.find();
          if (dbProducts.length > 0) {
            products = dbProducts;
            mongoose.connection.useDb(db);
            console.log(`Found ${products.length} products in ${db} database`);
            break;
          }
        } catch (e) {
          console.log(`Database ${db} not accessible for products:`, e.message);
        }
      }
    }
    
    // If still no products, try current database
    if (products.length === 0) {
      try {
        products = await Product.find();
        console.log(`Found ${products.length} products in current database`);
      } catch (e) {
        console.log('Error fetching products from current database:', e.message);
      }
    }
    
    console.log(`Total products found: ${products.length}`);
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
    const product = new Product(req.body);
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
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lead Routes
app.get('/api/leads', authenticateToken, async (req, res) => {
  try {
    // If employee, filter by assignedEmployee
    const isEmployee = req.user.role?.toLowerCase() === 'employee';
    const employeeEmail = isEmployee ? req.user.email : null;
    
    // Try to find leads in the protorq database first
    let leads = [];
    
    // Try protorq database first (most likely)
    try {
      const LeadModel = getLeadModel('protorq');
      if (isEmployee && employeeEmail) {
        // Filter by assignedEmployee for employees
        leads = await LeadModel.find({ 
          assignedEmployee: { $regex: new RegExp(employeeEmail, 'i') } 
        });
        console.log(`Found ${leads.length} leads assigned to employee ${employeeEmail} in protorq database`);
      } else {
        // Admin gets all leads
        leads = await LeadModel.find();
        console.log(`Found ${leads.length} leads in protorq database`);
      }
    } catch (e) {
      console.log('protorq database not accessible, trying other databases...');
    }
    
    // If no leads found, search across all databases
    if (leads.length === 0) {
      if (isEmployee && employeeEmail) {
        // Search across databases for employee leads
        const possibleDbs = ['protorq', 'Protorq', 'protoq', 'Protoq', 'test'];
        for (const db of possibleDbs) {
          try {
            const LeadModel = getLeadModel(db);
            const dbLeads = await LeadModel.find({ 
              assignedEmployee: { $regex: new RegExp(employeeEmail, 'i') } 
            });
            if (dbLeads.length > 0) {
              leads = dbLeads;
              mongoose.connection.useDb(db);
              console.log(`Found ${leads.length} leads assigned to employee in ${db} database`);
              break;
            }
          } catch (e) {
            console.log(`Database ${db} not accessible for employee leads:`, e.message);
          }
        }
      } else {
        leads = await findLeadsInDatabase();
      }
    }
    
    // If still no leads, try current database
    if (leads.length === 0) {
      try {
        if (isEmployee && employeeEmail) {
          leads = await Lead.find({ 
            assignedEmployee: { $regex: new RegExp(employeeEmail, 'i') } 
          });
          console.log(`Found ${leads.length} leads assigned to employee in current database`);
        } else {
          leads = await Lead.find();
          console.log(`Found ${leads.length} leads in current database`);
        }
      } catch (e) {
        console.log('Error fetching from current database:', e.message);
      }
    }
    
    console.log(`Total leads found: ${leads.length}`);
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/leads/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { assignedEmployee, comment } = req.body;
    
    // Try to find lead in protorq database first
    let lead = null;
    let LeadModel = null;
    const possibleDbs = ['protorq', 'Protorq', 'protoq', 'Protoq', 'test'];
    
    for (const db of possibleDbs) {
      try {
        LeadModel = getLeadModel(db);
        lead = await LeadModel.findById(req.params.id);
        if (lead) {
          mongoose.connection.useDb(db);
          break;
        }
      } catch (e) {
        // Continue to next database
      }
    }
    
    // If not found, try current database
    if (!lead) {
      lead = await Lead.findById(req.params.id);
    }
    
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
    
    // Try to find and delete lead in protorq database first
    let deleted = false;
    const possibleDbs = ['protorq', 'Protorq', 'protoq', 'Protoq', 'test'];
    
    for (const db of possibleDbs) {
      try {
        const LeadModel = getLeadModel(db);
        const result = await LeadModel.findByIdAndDelete(req.params.id);
        if (result) {
          deleted = true;
          break;
        }
      } catch (e) {
        // Continue to next database
      }
    }
    
    // If not found, try current database
    if (!deleted) {
      await Lead.findByIdAndDelete(req.params.id);
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
    
    // Try to find lead in protorq database first
    let lead = null;
    const possibleDbs = ['protorq', 'Protorq', 'protoq', 'Protoq', 'test'];
    
    for (const db of possibleDbs) {
      try {
        const LeadModel = getLeadModel(db);
        lead = await LeadModel.findById(leadId);
        if (lead) {
          mongoose.connection.useDb(db);
          break;
        }
      } catch (e) {
        // Continue to next database
      }
    }
    
    // If not found, try current database
    if (!lead) {
      lead = await Lead.findById(leadId);
    }
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Check if quotation exists in lead data
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
    const quotation = await Quotation.findOne({ leadId: req.params.id });
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
    
    // For now, return a simple PDF response
    // In production, you'd use a PDF library like pdfkit or puppeteer
    const pdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF');
    
    let quotation = await Quotation.findOne({ leadId });
    if (quotation) {
      quotation.products = products;
      quotation.terms = terms;
      quotation.verify = verify;
      quotation.currency = currency;
      quotation.pdf = pdfContent;
    } else {
      quotation = new Quotation({
        leadId,
        products,
        terms,
        verify,
        currency,
        pdf: pdfContent
      });
    }
    await quotation.save();
    
    // Update lead status
    await Lead.findByIdAndUpdate(leadId, { 
      status: 'completed',
      quotation: { exists: true }
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
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB connection: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});

