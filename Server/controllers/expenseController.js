const Expense = require("../models/Expense");

exports.createExpense = async (req, res) => {
  const { category, amount, date } = req.body;
  try {
    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newExpense = new Expense({ category, amount, date });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    console.error("Create expense error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error("Get expenses error:", err);
    res.status(500).json({ message: "Failed to retrieve expenses" });
  }
};


exports.getMonthlySummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" },
        }
      },
      {
        $sort: { "_id": -1 }
      }
    ]);

    const result = summary.map(s => ({
      month: s._id,
      total: s.total,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get summary" });
  }
};
