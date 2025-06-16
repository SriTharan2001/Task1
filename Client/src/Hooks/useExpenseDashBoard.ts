// src/Hooks/useExpenseDashboard.ts
import { useEffect, useState } from "react";

export type Expense = {
  _id?: string;
  date: string;
  amount: number | string;
  category?: string;
};

export type User = {
  _id?: string;
  name: string;
  email: string;
  role: string;
};

const BASE = "http://localhost:5000/api";

const useExpenseDashboard = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  const fetchAll = async () => {
    try {
      const [res1, res2] = await Promise.all([
        fetch(`${BASE}/expenses`),
        fetch(`${BASE}/auth/users`)
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      setExpenses(data1);
     setUsers(
  (data2 as Array<{ _id?: string; userName: string; email: string; role: string }>).map((u) => ({
    _id: u._id,
    name: u.userName,  // ✅ Properly mapped
    email: u.email,
    role: u.role,
  }))
);

    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  fetchAll();
}, []);


  return { expenses, users, loading, error };
};

export default useExpenseDashboard;
