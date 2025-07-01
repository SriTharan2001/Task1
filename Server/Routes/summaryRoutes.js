const express = require("express");
const router = express.Router();
const { getMonthlySummary } = require("../controllers/summaryController");

router.get("/summary", getMonthlySummary);

module.exports = router;
