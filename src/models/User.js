import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: { type: String, default: null },
    tokenExpiry: { type: Date, default: null }
});

export default mongoose.model('User', userSchema);
