const Expense = require("../models/expenseModel");
const csv = require("csv-parser");
const fs = require("fs");
const mongoose = require("mongoose");

// Utility function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Add a single expense
const addExpense = async (req, res) => {
  const { amount, description, category, paymentMethod, date } = req.body;

  if (!amount || !description || !category || !paymentMethod || !date) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const expense = await Expense.create({
      amount,
      description,
      category,
      paymentMethod,
      date,
      user: req.user._id,
    });

    res.status(201).json({ message: "Expense added successfully.", expense });
  } catch (error) {
    res.status(500).json({ message: "Error adding expense.", error });
  }
};

// Bulk add expenses via CSV
const bulkAddExpenses = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a CSV file." });
  }

  const filePath = req.file.path;
  const expenses = [];

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ message: "File not found." });
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        if (row.amount && row.description && row.category && row.paymentMethod && row.date) {
          expenses.push({
            amount: row.amount,
            description: row.description,
            category: row.category,
            paymentMethod: row.paymentMethod,
            date: new Date(row.date),
            user: req.user._id,
          });
        }
      })
      .on("end", async () => {
        if (expenses.length === 0) {
          return res.status(400).json({ message: "No valid data found in the CSV file." });
        }

        try {
          await Expense.insertMany(expenses);
          fs.unlinkSync(filePath); // Cleanup file
          res.status(201).json({ message: "Expenses added successfully." });
        } catch (error) {
          res.status(500).json({ message: "Error saving expenses.", error });
        }
      })
      .on("error", (error) => {
        console.error("Error reading file:", error);
        res.status(500).json({ message: "Error processing file.", error });
      });
  } catch (error) {
    res.status(500).json({ message: "Unexpected server error.", error });
  }
};

// Get all expenses with filtering, sorting, and pagination
const getExpenses = async (req, res) => {
  const {
    category,
    dateFrom,
    dateTo,
    paymentMethod,
    sort = "-date",
    page = 1,
    limit = 10,
  } = req.query;

  const filter = { user: req.user._id };

  if (category) filter.category = category;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  try {
    const expenses = await Expense.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalExpenses = await Expense.countDocuments(filter);
    res.status(200).json({
      expenses,
      totalExpenses,
      currentPage: Number(page),
      totalPages: Math.ceil(totalExpenses / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching expenses.", error });
  }
};

// Update an expense
const updateExpense = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid expense ID." });
  }

  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    res.status(200).json({ message: "Expense updated successfully.", expense });
  } catch (error) {
    res.status(500).json({ message: "Error updating expense.", error });
  }
};

// Delete single or bulk expenses
const deleteExpenses = async (req, res) => {
  let { ids } = req.body;

  if (!Array.isArray(ids)) {
    ids = [ids];
  }

  if (!ids.length || !ids.every(isValidObjectId)) {
    return res.status(400).json({ message: "Invalid or missing expense IDs." });
  }

  try {
    const result = await Expense.deleteMany({
      _id: { $in: ids },
      user: req.user._id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No expenses found with the provided IDs." });
    }

    res.status(200).json({ message: "Expenses deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expenses.", error });
  }
};

module.exports = {
  addExpense,
  bulkAddExpenses,
  getExpenses,
  updateExpense,
  deleteExpenses,
};