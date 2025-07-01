export type Expense = {
  _id?: string;
  date: string;
  amount: number;
  category?: string;
};

export type User = {
  _id?: string;
  name: string;
  email: string;
  role: string;
};

const BASE = "http://localhost:5000/api";

export const fetchExpenses = async (userId: string): Promise<Expense[]> => {
  const res = await fetch(`${BASE}/expenses?userId=${userId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
};

export const addExpense = async (expense: Expense & { userId: string }): Promise<Expense> => {
  const res = await fetch(`${BASE}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  return res.json();
};
