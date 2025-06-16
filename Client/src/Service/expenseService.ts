// expenseService.ts
import axios from "axios";

const API_URL = "http://localhost:5000/api/expenses";

// Fetch all expenses
export const getExpenses = async () => {
  const response = await axios.get(API_URL);
  return response.data as Expense[];
};

// Define the Expense interface
export interface Expense {
  _id: string;
  title: string;
  amount: number;
  date: string;
  // Add other fields as needed
}

// Update a specific expense
export const updateExpense = async (id: string, updatedData: Expense) => {
  const response = await axios.put(`${API_URL}/${id}`, updatedData);
  return response.data;
};

// Delete an expense
export const deleteExpense = async (id: string) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
