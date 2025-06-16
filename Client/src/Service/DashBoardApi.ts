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

export const fetchExpenses = async (): Promise<Expense[]> => {
  const res = await fetch(`${BASE}/expenses`);
  return res.json();
};

export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch(`${BASE}/auth`);
  return res.json();
};

export const addExpense = async (expense: Expense): Promise<Expense> => {
  const res = await fetch(`${BASE}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense),
  });
  return res.json();
};
