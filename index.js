import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "forgot-password-frontend.netlify.app"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
}));

app.get('/', (req, res) => {
    res.send('API is running...');
});


app.use('/api', authRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
