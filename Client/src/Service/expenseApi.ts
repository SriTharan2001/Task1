// Service/expenseApi.ts (replace fetch with axios 'api')

import api from "../utils/api";

export const createExpense = async (expense: { category: string; amount: number; date: string, userId: string }) => {
  try {
    const response = await api.post("/api/expenses", expense);
    return response.data;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to create expense");
    }
    throw new Error("Failed to create expense");
  }
};

// Add your fetchExpenses function here, properly structured
export const fetchExpenses = async (userId: string) => {
  try {
    const response = await api.get(`/api/expenses?userId=${userId}`);
    return response.data;
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
      const err = error as { response?: { data?: { message?: string } } };
      throw new Error(err.response?.data?.message || "Failed to fetch expenses");
    }
    throw new Error("Failed to fetch expenses");
  }
}
