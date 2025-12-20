const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 1. MONGODB CONNECTION
// Replace 'YOUR_MONGODB_URI' with the string from Atlas or use process.env.MONGO_URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Meizo:password12333@cluster0.lwkpzr7.mongodb.net/?appName=Cluster0';


mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

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

const User = mongoose.model('User', userSchema);
const Log = mongoose.model('Log', logSchema);

// 3. AUTO-SEEDER (Runs on startup)
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
seedUser();

// 4. ROUTES
app.post('/api/login', async (req, res) => {
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

// Route to save logs (The feature we added earlier)
app.post('/api/logs', async (req, res) => {
  try {
    const newLog = new Log(req.body);
    await newLog.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save log" });
  }
});

// 5. LISTEN
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));

