const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");

router.get("/fetch/:userId", expenseController.fetchUserExpenses);
router.post("/", expenseController.createExpense);
router.put("/:id", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);
router.get("/category/:userId/:category", expenseController.fetchExpensesByCategory);
router.get("/date/:userId/:date", expenseController.fetchExpensesByDate);
// routes/expenseRoutes.js
router.get('/category-wise', expenseController.getCategoryWiseExpenses);

router.get("/total", expenseController.getTotalExpenses);
router.get("/monthly", expenseController.getMonthlyExpenses);
router.get("/daily", expenseController.getTodayExpenses);

module.exports = router;