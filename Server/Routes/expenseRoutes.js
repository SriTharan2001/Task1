const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");

router.get("/fetch/:userId", expenseController.fetchUserExpenses);
router.post("/", expenseController.createExpense);
router.put("/:id", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);
router.get("/category/:userId/:category", expenseController.fetchExpensesByCategory);
router.get("/date/:userId/:date", expenseController.fetchExpensesByDate);

module.exports = router;