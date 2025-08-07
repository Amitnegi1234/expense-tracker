import Expense from "../models/expense.js";
import User from "../models/user.js";
import { db } from "../utils/db.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { uploadToS3, s3Client } from "../services/s3services.js";


export const addExpense = async (req, res) => {
  const t = await db.transaction();

  try {
    const { amount, description, category } = req.body;
    console.log("Received expense data:", req.body);

    const expense = await Expense.create(
      {
        amount,
        description,
        category,
        loginUserId: req.user.id,
      },
      { transaction: t }
    );

    const user = await User.findByPk(req.user.id, { transaction: t });
    user.totalExpense = (user.totalExpense || 0) + parseInt(amount);
    await user.save({ transaction: t });

    await t.commit();
    res.status(201).send("Expense added");
  } catch (error) {
    await t.rollback();
    console.error("Error in addExpense:", error);
    res.status(500).send(error);
  }
};

export const showExpense = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 2;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const { count, rows } = await Expense.findAndCountAll({
      where: { loginUserId: req.user.id },
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      expenses: rows,
      totalCount: count,
      success: true,
    });
  } catch (err) {
    console.error("Error in showExpense:", err);
    res.status(400).json({ error: err, success: false });
  }
};


export const deleteExpense = async (req, res) => {
  const t = await db.transaction();

  try {
    const { id } = req.params;
    const expense = await Expense.findOne({
      where: { id, loginUserId: req.user.id },
      transaction: t,
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ message: "Expense not found or not authorized" });
    }

    await Expense.destroy({
      where: { id, loginUserId: req.user.id },
      transaction: t,
    });

    // Update the user's totalExpense
    const user = await User.findByPk(req.user.id, { transaction: t });
    user.totalExpense = (user.totalExpense || 0) - parseInt(expense.amount);
    await user.save({ transaction: t });

    await t.commit();
    res.status(200).json({ message: "Deleted successfully",totalExpense: user.totalExpense  });
  } catch (err) {
    await t.rollback(); 
    console.error("Error deleting expense:", err);
    res.status(500).json({ error: "Error deleting expense" });
  }
};

export const getPremiumExpense = async (req, res) => {
  try {
    const leaderBoard = await User.findAll({
      attributes: ["id", "name", "totalExpense"],
      order: [["totalExpense", "DESC"]],
    });

    res.status(200).json(leaderBoard);
  } catch (error) {
    console.error("Error in getPremiumExpense:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};



export const downloadExpenses = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        console.log('User premium status:', user.isPremium, 'User ID:', user.id);

        if (!user.isPremium) {
            return res.status(401).json({ success: false, message: 'User is not a premium user' });
        }

        const expenses = await req.user.getExpenses();
        if (expenses.length === 0) {
            return res.status(200).json({ success: true, message: 'No expenses to download' });
        }

        const stringifiedExpenses = JSON.stringify(expenses, null, 2); // Pretty print JSON
        const filename = `expenses-${req.user.id}-${Date.now()}.json`;

        // Upload file to S3
        await uploadToS3(stringifiedExpenses, filename);

        // Generate signed URL (forces download instead of opening in browser)
        const command = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: filename,
            ResponseContentDisposition: `attachment; filename="${filename}"`
        });

        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

        res.status(200).json({ fileUrl: signedUrl, success: true });
    } catch (err) {
        console.error('Error in downloadExpenses:', err);
        res.status(500).json({ success: false, message: 'Failed to download expenses' });
    }
};
