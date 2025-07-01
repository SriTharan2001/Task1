const mongoose = require("mongoose");
const Expense = require("../Models/Expense");

exports.getMonthlySummary = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const summary = await Expense.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },  // Filter by userId
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, // Group by year-month
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
