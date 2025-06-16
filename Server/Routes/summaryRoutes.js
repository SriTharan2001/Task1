const express = require('express');
const router = express.Router();
const {
  getMonthlySummary,
  createExpense,
} = require('../controllers/summaryController');

router.get('/', getMonthlySummary);
router.post('/', createExpense);

module.exports = router;
//
