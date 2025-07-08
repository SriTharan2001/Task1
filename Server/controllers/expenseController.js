const Expense = require("../Models/Expense");
const mongoose = require("mongoose");

exports.fetchUserExpenses = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching expenses for userId:", userId); // Add this line
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid userId:", userId); // Add this line
      return res.status(400).json({ message: "Invalid userId" });
    }
    const expenses = await Expense.find({ userId: new mongoose.Types.ObjectId(userId) });
    console.log("Expenses:", expenses); // Add this line
    res.json(expenses);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};

// expenseController.js (update createExpense method)
exports.createExpense = async (req, res) => {
  try {
    const { category, amount, date, userId, title } = req.body;

    // Validate required fields
    if (!category || typeof category !== "string" || category.trim() === "") {
      return res.status(400).json({ message: "Category is required" });
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Amount must be a positive number" });
    }

    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "Title is required" });
    }

    const expense = new Expense({
      category,
      amount,
      date,
      userId,
      title,
    });

    await expense.save();
    req.io.emit("expense_update", { type: "CREATE_EXPENSE", payload: expense });
    res.status(201).json(expense);
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ message: "Failed to create expense" });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Expense not found" });
    }
    req.io.emit("expense_update", { type: "UPDATE_EXPENSE", payload: updated });
    res.json(updated);
  } catch (err) {
    console.error("Update error:", err);
    res.status(400).json({ message: "Failed to update expense" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    req.io.emit("expense_update", { type: "DELETE_EXPENSE", payload: { id: req.params.id } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(400).json({ message: "Failed to delete expense" });
  }
};

// controllers/expenseController.js
exports.fetchExpensesByCategory = async (req, res) => {
  try {
    const { userId, category } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    const expenses = await Expense.find({
      userId: new mongoose.Types.ObjectId(userId),
      category,
    });
    res.json(expenses);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};


exports.fetchExpensesByDate = async (req, res) => {
  try {
    const { userId, date } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }
    const expenses = await Expense.find({ userId: new mongoose.Types.ObjectId(userId), date });
    res.json(expenses);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
};




// controllers/expenseController.js
exports.getCategoryWiseExpenses = async (req, res) => {
  try {
    const expenses = await Expense.aggregate([
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const result = expenses.map(item => ({
      name: item._id || "Uncategorized",
      value: item.totalAmount,
      count: item.count
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching category expenses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// totel



// Get total of all expenses
exports.getTotalExpenses = async (req, res) => {
  try {
    const total = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    res.json({ total: total[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current month's expenses
exports.getMonthlyExpenses = async (req, res) => {
  try {
    const now = new Date();
    const monthly = await Expense.aggregate([
      { 
        $match: { 
          date: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
          }
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    res.json({ total: monthly[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get today's expenses
exports.getTodayExpenses = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const daily = await Expense.aggregate([
      { 
        $match: { 
          date: {
            $gte: today,
            $lt: tomorrow
          }
        } 
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    res.json({ total: daily[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};