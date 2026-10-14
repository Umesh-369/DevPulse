import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devpulse';
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log('MongoDB Connected successfully to:', mongoURI);
  } catch (error) {
    isConnected = false;
    console.warn('MongoDB connection failed or not available locally. DevPulse will run in autonomous hybrid mode with in-memory persistence and mock seed fallbacks.');
  }
};

export const getDBStatus = () => isConnected;
