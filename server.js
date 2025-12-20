const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 1. MONGODB CONNECTION
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Meizo:password12333@cluster0.lwkpzr7.mongodb.net/?appName=Cluster0';

// Use a variable to track connection status (Best practice for Vercel/Serverless)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas');
    await seedUser(); // Seed only after a successful connection
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
};

// 2. DEFINE SCHEMAS (Tables)
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

const logSchema = new mongoose.Schema({
  ip: String,
  location: String,
  isp: String,
  timestamp: { type: Date, default: Date.now }
});

// Check if model exists before defining (Prevents OverwriteModelError in Vercel)
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Log = mongoose.models.Log || mongoose.model('Log', logSchema);

// 3. AUTO-SEEDER
const seedUser = async () => {
  try {
    const testUser = await User.findOne({ email: 'iptrack@sample.com' });
    if (!testUser) {
      await User.create({ email: 'iptrack@sample.com', password: 'passwordip123' });
      console.log("✅ User Seeder: Test user created!");
    }
  } catch (err) {
    console.error("Seeder error:", err);
  }
};

// 4. ROUTES
app.post('/api/login', async (req, res) => {
  await connectDB(); // Ensure DB is connected before handling request
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      res.json({ success: true, user: { email: user.email } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

app.post('/api/logs', async (req, res) => {
  await connectDB(); // Ensure DB is connected
  try {
    const newLog = new Log(req.body);
    await newLog.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save log" });
  }
});

// Default route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 5. LISTEN (Modified for Vercel)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => console.log(`🚀 Local API running on port ${PORT}`));
}

// 6. EXPORT FOR VERCEL
module.exports = app;