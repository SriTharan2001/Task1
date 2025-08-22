const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Expense = require("../Models/Expense.js"); // Make sure path matches your project
const path = require("path");



const validUserId = new mongoose.Types.ObjectId();
let createdExpenseId;

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect("mongodb://127.0.0.1:27017/expense_test", {
    // Remove deprecated options for MongoDB v4+
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear Expenses collection before each test
  await Expense.deleteMany({});
});

describe("Expense Controller API Tests", () => {

  // ------------------ TC001: Fetch with valid userId ------------------
  it("TC001: Fetch with valid userId", async () => {
    await Expense.create({
      category: "Food",
      amount: 100,
      date: new Date(),
      userId: validUserId,
      title: "Lunch",
    });
    const res = await request(app).get(`/api/expenses/fetch/${validUserId}`);
    // console.log("Response Body:", res.body); // Removed console.log
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ------------------ TC002: Fetch with invalid userId ------------------
  it("TC002: Fetch with invalid userId", async () => {
    const res = await request(app).get(`/api/expenses/fetch/123`);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid userId");
  });

  // ------------------ TC003: Fetch with no expenses ------------------
  it("TC003: Fetch with no expenses for new userId", async () => {
    const newUserId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/expenses/fetch/${newUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  // ------------------ TC004: Create a new expense ------------------
  it("TC004: Create with valid data", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .send({
        category: "Travel",
        amount: 200,
        date: new Date(),
        userId: validUserId,
        title: "Cab",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    createdExpenseId = res.body._id; // Save for future tests
  });

  // ------------------ TC005-TC008: Invalid create requests ------------------
  it("TC005: Missing category", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .send({ amount: 50, date: new Date(), userId: validUserId, title: "Test" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Category is required");
  });

  it("TC006: Invalid amount", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .send({ category: "Food", amount: -10, date: new Date(), userId: validUserId, title: "Test" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Amount must be a positive number");
  });

  it("TC007: Invalid date", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .send({ category: "Food", amount: 100, date: "abcd", userId: validUserId, title: "Test" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid date");
  });

  it("TC008: Invalid userId", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .send({ category: "Food", amount: 100, date: new Date(), userId: "123", title: "Test" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid userId");
  });

  // ------------------ TC009: Update existing expense ------------------
  it("TC009: Update existing expense", async () => {
    const expenseToUpdate = await Expense.create({
      category: "Food",
      amount: 100,
      date: new Date(),
      userId: validUserId,
      title: "Lunch",
    });
    const res = await request(app)
      .put(`/api/expenses/${expenseToUpdate._id.toString()}`)
      .send({ category: "Groceries", amount: 150, title: "Weekly Groceries" });
    expect(res.statusCode).toBe(200);
    expect(res.body.category).toBe("Groceries");
    expect(res.body.amount).toBe(150);
    expect(res.body.title).toBe("Weekly Groceries");
  });

  // ------------------ TC010: Update non-existing expense ------------------
  it("TC010: Update non-existing expense", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/expenses/${nonExistentId}`)
      .send({ category: "Groceries", amount: 150, title: "Weekly Groceries" });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Expense not found");
  });

  // ------------------ TC011: Delete existing expense ------------------
  it("TC011: Delete existing expense", async () => {
    const expenseToDelete = await Expense.create({
      category: "Food",
      amount: 100,
      date: new Date(),
      userId: validUserId,
      title: "Lunch",
    });
    const res = await request(app).delete(`/api/expenses/${expenseToDelete._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Deleted successfully");
  });

  // ------------------ TC012: Delete non-existing expense ------------------
  it("TC012: Delete non-existing expense", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/expenses/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Expense not found");
  });

  // ------------------ TC013: Fetch by Category - Valid category and userId ------------------
    it("TC013: Fetch by Category - Valid category and userId", async () => {
    const categoryToFetch = "Groceries";
    await Expense.create({
      category: categoryToFetch,
      amount: 50,
      date: new Date(),
      userId: validUserId,
      title: "Milk",
    });
    // Corrected the URL to match the route definition in expenseRoutes.js
    const res = await request(app).get(`/api/expenses/category/${validUserId}/${categoryToFetch}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(expense => expense.category === categoryToFetch)).toBe(true);
  });

  // ------------------ TC014: Fetch by Category - Invalid userId ------------------
    it("TC014: Fetch by Category - Invalid userId", async () => {
    const res = await request(app).get(`/api/expenses/category/123/Food`);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid userId");
  });

  // ------------------ TC015: Fetch by Date - Valid date ------------------
  it("TC015: Fetch by Date - Valid date", async () => {
    const expenseDate = new Date("2025-08-22T10:00:00.000Z");
    await Expense.create({
      category: "Food",
      amount: 75,
      date: expenseDate,
      userId: validUserId,
      title: "Dinner",
    });
    const dateString = expenseDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const res = await request(app).get(`/api/expenses/date/${validUserId}/${dateString}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(expense => new Date(expense.date).toISOString().split('T')[0] === dateString)).toBe(true);
  });

  // ------------------ TC016: Fetch by Date - Invalid userId ------------------
    it("TC016: Fetch by Date - Invalid userId", async () => {
    const res = await request(app).get(`/api/expenses/date/123/2025-08-22`);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid userId");
  });

// ------------------ TC017: Get Category Wise Expenses - Valid request ------------------
// it("TC017: Get Category Wise Expenses - Valid request", async () => {
//   // Clean previous test data (optional, if using a test DB)
//   await Expense.deleteMany({ userId: validUserId });

//   // Create test expenses
//   await Expense.create({ category: "Food", amount: 100, date: new Date(), userId: validUserId, title: "Lunch" });
//   await Expense.create({ category: "Travel", amount: 200, date: new Date(), userId: validUserId, title: "Cab" });
//   await Expense.create({ category: "Food", amount: 50, date: new Date(), userId: validUserId, title: "Snacks" });

//   // Call the API
//   const res = await request(app).get(`/api/expenses/categoryWise`);

//   // Check HTTP status
//   expect(res.statusCode).toBe(200);

//   // Ensure the response is an array
//   expect(Array.isArray(res.body)).toBe(true);

//   // Find specific categories
//   const foodCategory = res.body.find(cat => cat.category === "Food");
//   const travelCategory = res.body.find(cat => cat.category === "Travel");

//   // Ensure categories exist
//   expect(foodCategory).toBeDefined();
//   expect(travelCategory).toBeDefined();

//   // Check totals and counts
//   expect(foodCategory.total).toBe(150);   // 100 + 50
//   expect(foodCategory.count).toBe(2);     // 2 items
//   expect(travelCategory.total).toBe(200); // 1 item
//   expect(travelCategory.count).toBe(1);
// });


  // ------------------ TC018: Get Total Expenses - Valid request ------------------
  it("TC018: Get Total Expenses - Valid request", async () => {
    await Expense.create({ category: "Food", amount: 100, date: new Date(), userId: validUserId, title: "Lunch" });
    await Expense.create({ category: "Travel", amount: 200, date: new Date(), userId: validUserId, title: "Cab" });
    const res = await request(app).get(`/api/expenses/total`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.total).toBe(300);
  });

  // ------------------ TC019: Get Monthly Expenses - Valid request ------------------
  it("TC019: Get Monthly Expenses - Valid request", async () => {
    await Expense.create({ category: "Food", amount: 100, date: new Date(), userId: validUserId, title: "Lunch" });
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await Expense.create({ category: "Travel", amount: 200, date: yesterday, userId: validUserId, title: "Cab" });
    const res = await request(app).get(`/api/expenses/monthly`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.total).toBe(300);
  });

  // ------------------ TC020: Get Today Expenses - Valid request ------------------
  // it("TC020: Get Today Expenses - Valid request", async () => {
  //   const now = new Date();
  //   const todayStartUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  //   await Expense.create({ category: "Food", amount: 100, date: todayStartUTC, userId: validUserId, title: "Lunch" });
  //   await Expense.create({ category: "Travel", amount: 200, date: todayStartUTC, userId: validUserId, title: "Cab" });
  //   const res = await request(app).get(`/api/expenses/today`);
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toBeInstanceOf(Object);
  //   expect(res.body.total).toBe(300);
  // });

  // ------------------ TC021: Get Today Expenses - No expenses today ------------------
  // it("TC021: Get Today Expenses - No expenses today", async () => {
  //   const res = await request(app).get(`/api/expenses/today`);
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toBeInstanceOf(Object);
  //   expect(res.body.total).toBe(0);
  // });
});
