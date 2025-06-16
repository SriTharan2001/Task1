const express = require('express');
const { createExpense, getAllExpenses, getMonthlySummary } = require('../controllers/expenseController');

const router = express.Router();

router.get('/', getAllExpenses);
router.post('/', createExpense);
router.get('/summary', getMonthlySummary);

module.exports = router;
