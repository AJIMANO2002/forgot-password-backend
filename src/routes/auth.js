import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createTransport } from 'nodemailer';
import User from '../models/User.js';

const router = Router();

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found!" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    user.resetToken = token;
    user.tokenExpiry = Date.now() + 3600000; 
    await user.save();

    const transporter = createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset Request",
        html: `<p>Click <a href="http://localhost:5173/reset-password/${token}">here</a> to reset your password.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Reset link sent to email!" });
    } catch (err) {
        res.status(500).json({ message: "Email could not be sent!" });
    }
});

router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.id, resetToken: token, tokenExpiry: { $gt: Date.now() } });

        if (!user) return res.status(400).json({ message: "Invalid or expired token!" });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = null;
        user.tokenExpiry = null;
        await user.save();

        res.json({ message: "Password reset successful!" });
    } catch (err) {
        res.status(400).json({ message: "Invalid token!" });
    }
});

export default router;
