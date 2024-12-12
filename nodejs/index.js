// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(ClerkExpressWithAuth());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profileCompleted: { type: Boolean, default: false },
  name: String,
  occupation: String,
  // Add any other fields you need for the form
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/api/complete-profile', async (req, res) => {
  try {
    const { clerkId } = req.auth;
    const { name, occupation } = req.body;

    const user = await User.findOneAndUpdate(
      { clerkId },
      { 
        name,
        occupation,
        profileCompleted: true
      },
      { new: true, upsert: true }
    );

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user-profile', async (req, res) => {
  try {
    const { clerkId } = req.auth;
    const user = await User.findOne({ clerkId });
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});