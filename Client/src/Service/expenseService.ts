import axios from "axios";
import type { Expense } from "../Types/Expense";

const BASE_URL = "http://localhost:5000/api";

const getExpenses = async (userId: string): Promise<Expense[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/expenses/fetch`, {
      params: { userId }
    });
    return response.data as Expense[];
  } catch (error) {
    console.error("Error fetching expenses:", error);
    throw error;
  }
};

const getExpensesByCategory = async (userId: string, category: string): Promise<Expense[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/expenses/fetchByCategory`, {
      params: { userId, category }
    });
    return response.data as Expense[];
  } catch (error) {
    console.error("Error fetching expenses by category:", error);
    throw error;
  }
};

const getExpensesByDate = async (userId: string, date: string): Promise<Expense[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/expenses/fetchByDate`, {
      params: { userId, date }
    });
    return response.data as Expense[];
  } catch (error) {
    console.error("Error fetching expenses by date:", error);
    throw error;
  }
};

const updateExpense = async (id: string, updatedData: Partial<Expense> & { userId: string }) => {
  try {
    const response = await axios.put(`${BASE_URL}/expenses/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw error;
  }
};

const deleteExpense = async (id: string, userId: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}/expenses/${id}`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw error;
  }
};

// expenseService.ts
export const createExpense = async (expense: {
  category: string;
  amount: number;
  date: string;
  userId: string;
  title: string;
}) => {
  const response = await fetch("http://localhost:5000/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create expense");
  }

  return response.json();
};


export const expenseService = {
  getExpenses,
  getExpensesByCategory,
  getExpensesByDate,
  updateExpense,
  deleteExpense,
  createExpense,
};
