import User from "../models/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendEmail } from "../utils/sendEmail.js";
import ForgotPasswordRequest from "../models/forgetPassword.js";
import path from 'path';
import dotenv from "dotenv";
dotenv.config({quiet:true})
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { v4 as uuidv4 } from "uuid";

export const addUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        bcrypt.hash(password, 5, async (err, hash) => {
            if (err) {
                console.log(err);
                return;
            }
            const user = await User.create({
                name: name,
                email: email,
                password: hash,
                totalExpense: 0
            })
            res.status(201).send(`user with name ${name} added`)
        })

    } catch (error) {
        console.log(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).send("Email already exists");
        }
        res.status(500).send(error.message)
    }
}
function generateAccessToken(id) {
    return jwt.sign({ userId: id }, process.env.JWT_SECRET)
}
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            where: {
                email: email
            }
        })
        if (!user) {
            return res.status(404).send("email not found");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(500).send("password incorrect");
        }
        return res.status(200).json({ success: true, message: "User logged in", token: generateAccessToken(user.id) });
    } catch (error) {
        res.status(500).send("Server error");
    }
}


export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) throw new Error('User does not exist');

        const id = uuidv4();
        await user.createForgotPasswordRequest({ id, active: true });

        await sendEmail(
            email,
            "Reset Your Password",
            `<a href="http://localhost:3000/password/reset-password/${id}">Reset password</a>`
        );

        res.status(202).json({ message: 'Link sent to email', success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message, success: false });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const request = await ForgotPasswordRequest.findOne({ where: { id: token } });

    if (request) {
        await request.update({ active: false });
        res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'resetPassword.html'));
    } else {
        res.status(400).send("Invalid link");
    }
};

export const updatePassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const resetRequest = await ForgotPasswordRequest.findOne({ where: { id: token } });
        if (!resetRequest) return res.status(400).json({ error: 'Invalid request' });

        const user = await User.findOne({ where: { id: resetRequest.loginUserId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const hash = await bcrypt.hash(password, 10);
        await user.update({ password: hash });

        res.status(200).json({ message: "Password successfully updated" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
