// src/Service/expenseService.ts
import api from "../utils/api"; // Axios instance with token
import type { ExpenseFormData } from "../Hooks/useExpenseForm";
import type { Expense } from "../Types/Expense";

// Define interface for Expense Summary (adjust fields as per your API response)
export interface ExpenseSummary {
  totalAmount: number;
  totalCount: number;
  perCategory: {
    [category: string]: number; // amount spent per category
  };
  // Add more fields if needed
}

// Define interface for Category Wise data (adjust fields as per your API response)
export interface CategoryWiseData {
  name: string;
  value: number;
  count: number;
}

export const expenseService = {
  async createExpense(data: ExpenseFormData): Promise<Expense> {
    const response = await api.post<Expense>("/api/expenses", data);
    return response.data;
  },

  async getExpenses(userId: string): Promise<Expense[]> {
    const response = await api.get<Expense[]>("/api/expenses/fetch", {
      params: { userId },
    });
    return response.data;
  },

  async getExpensesByCategory(userId: string, category: string): Promise<Expense[]> {
    const response = await api.get<Expense[]>("/api/expenses/fetchByCategory", {
      params: { userId, category },
    });
    return response.data;
  },

  async getExpensesByDate(userId: string, date: string): Promise<Expense[]> {
    const response = await api.get<Expense[]>("/api/expenses/fetchByDate", {
      params: { userId, date },
    });
    return response.data;
  },

  async updateExpense(id: string, updatedData: Partial<Expense> & { userId: string }): Promise<Expense> {
    const response = await api.put<Expense>(`/api/expenses/${id}`, updatedData);
    return response.data;
  },

  async deleteExpense(id: string, userId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/api/expenses/${id}`, {
      params: { userId },
    });
    return response.data;
  },

  async getSummary(userId: string): Promise<ExpenseSummary> {
    const response = await api.get<ExpenseSummary>(`/api/expenses/summary/${userId}`);
    return response.data;
  },

  async getCategoryWise(): Promise<CategoryWiseData[]> {
    const response = await api.get<CategoryWiseData[]>("/api/expenses/category-wise");
    return response.data;
  },
};
