const mongoose = require("mongoose");
const Expense = require("../Models/Expense");

exports.getMonthlySummary = async (req, res) => {
  try {
    let matchStage = {};
    const userId = req.query.userId;

    if (userId) {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(userId)) {
        // If format is invalid, return 400 Bad Request
        return res.status(400).json({ message: "Invalid userId format" });
      }
      // Convert to ObjectId. If this throws, the outer catch will handle it.
      matchStage.userId = new mongoose.Types.ObjectId(userId);
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

    // The aggregation pipeline should return an array (empty if no documents match)
    res.status(200).json(summary);

  } catch (err) {
    console.error("Aggregation error:", err);
    // Return 500 for actual database/aggregation errors
    res.status(500).json({ message: "Failed to fetch monthly summary" });
  }
};
