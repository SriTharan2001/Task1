const Expense = require('../models/Expense');

// Get all expenses
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new expense
const createExpense = async (req, res) => {
  const { category, amount, date } = req.body;
  const expense = new Expense({
    category,
    amount,
    date: new Date(date),
  });

  try {
    const newExpense = await expense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update an expense
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    expense.category = req.body.category || expense.category;
    expense.amount = req.body.amount || expense.amount;
    expense.date = req.body.date ? new Date(req.body.date) : expense.date;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete an expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get monthly summary
const getMonthlySummary = async (req, res) => {
  try {
    console.log("Before aggregation:", Expense);
    const summary = await Expense.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 },
      },
      {
        $project: {
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  [
                    '',
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                  ],
                  '$_id.month',
                ],
              },
              ' ',
              { $toString: '$_id.year' },
            ],
          },
          total: 1,
          _id: 0,
        },
      },
    ]);
    console.log("After aggregation:", summary);
    res.json(summary);
  } catch (err) {
    console.error('Error fetching monthly summary:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Seed sample data
const seedExpenses = async (req, res) => {
  try {
    await Expense.deleteMany({});
    const sampleExpenses = [
      { category: 'Food', amount: 5000, date: new Date('2025-01-15') },
      { category: 'Travel', amount: 7500, date: new Date('2025-01-20') },
      { category: 'Food', amount: 4800, date: new Date('2025-02-10') },
      { category: 'Utilities', amount: 5000, date: new Date('2025-02-15') },
      { category: 'Rent', amount: 10000, date: new Date('2025-03-01') },
      { category: 'Entertainment', amount: 4250, date: new Date('2025-03-05') },
    ];
    await Expense.insertMany(sampleExpenses);
    res.json({ message: 'Sample data seeded' });
  } catch (err) {
    console.error('Error seeding data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
  seedExpenses,
};
