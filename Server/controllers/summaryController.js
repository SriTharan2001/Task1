const mongoose = require("mongoose");
const Expense = require("../Models/Expense");

exports.getMonthlySummary = async (req, res) => {
  try {
    let matchStage = {};
    // If userId is sent as query param (e.g., /api/summary?userId=xxx)
    if (req.query.userId) {
      matchStage.userId = mongoose.Types.ObjectId(req.query.userId);
    }

    const summary = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          month: "$_id",
          total: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch monthly summary" });
  }
};
