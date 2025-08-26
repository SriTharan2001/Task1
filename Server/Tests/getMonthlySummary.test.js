const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const Expense = require("../Models/Expense");

// Controller import
const { getMonthlySummary } = require("../controllers/summaryController");

// Create express app with route
const app = express();
app.get("/api/summary", getMonthlySummary);

// Mock DB
jest.mock("../Models/Expense");

describe("GET /api/summary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TC-001
  it("should return all users summary when no userId param", async () => {
    Expense.aggregate.mockResolvedValue([
      { month: "2025-01", total: 300 },
      { month: "2024-12", total: 500 },
    ]);

    const res = await request(app).get("/api/summary");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { month: "2025-01", total: 300 },
      { month: "2024-12", total: 500 },
    ]);
    expect(Expense.aggregate).toHaveBeenCalled();
  });

  // TC-002
  it("should return summary for given valid userId", async () => {
    const userId = new mongoose.Types.ObjectId();
    Expense.aggregate.mockResolvedValue([{ month: "2025-01", total: 200 }]);

    const res = await request(app).get(`/api/summary?userId=${userId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ month: "2025-01", total: 200 }]);
  });

  // TC-003
  it("should return empty array if user has no expenses", async () => {
    const userId = new mongoose.Types.ObjectId();
    Expense.aggregate.mockResolvedValue([]);

    const res = await request(app).get(`/api/summary?userId=${userId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // TC-004
  it("should return 400 for invalid userId format", async () => {
    const res = await request(app).get("/api/summary?userId=12345");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Invalid userId format" });
  });

  // TC-005
  it("should return 500 when DB aggregation fails", async () => {
    Expense.aggregate.mockRejectedValue(new Error("DB error"));

    const res = await request(app).get("/api/summary");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Failed to fetch monthly summary" });
  });

  // TC-006
  it("should return months sorted in descending order", async () => {
    Expense.aggregate.mockResolvedValue([
      { month: "2025-02", total: 100 },
      { month: "2025-01", total: 200 },
    ]);

    const res = await request(app).get("/api/summary");

    expect(res.status).toBe(200);
    expect(res.body[0].month >= res.body[1].month).toBeTruthy();
  });

  // TC-007
  it("should return only month and total fields", async () => {
    Expense.aggregate.mockResolvedValue([{ month: "2025-01", total: 100 }]);

    const res = await request(app).get("/api/summary");

    expect(res.status).toBe(200);
    expect(Object.keys(res.body[0])).toEqual(["month", "total"]);
  });

  // TC-008
  it("should filter summary by userId when multiple users exist", async () => {
    const userId = new mongoose.Types.ObjectId();
    Expense.aggregate.mockResolvedValue([{ month: "2025-01", total: 500 }]);

    const res = await request(app).get(`/api/summary?userId=${userId}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ month: "2025-01", total: 500 }]);
  });
});

