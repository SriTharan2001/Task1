// src/Hooks/useExpenseDashboard.ts
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useStore from "pulsy";
import type { Expense } from "../Types/Expense";
import type { User } from "../Types/User";
import type { LoginResponse } from "../Types/LoginResponse.ts";
import { expenseService } from "../Service/expenseService.ts";

// Define your backend base URL here
const BASE_URL = "http://localhost:5000";

const useExpenseDashboard = () => {
  const [auth] = useStore<LoginResponse>("auth");
  const userId = auth?.user?.objectId;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      if (!userId) {
        setExpenses([]);
        setLoading(false);
        return;
      }

      // Fetch all expenses (or modify to fetch by category)
      const expensesData = await expenseService.getExpenses(userId);
      setExpenses(expensesData);
      // Optionally fetch users if needed
      const usersRes = await fetch(`${BASE_URL}/users`);
      if (!usersRes.ok) throw new Error("Failed to fetch users");
      const usersData = await usersRes.json();
      setUsers(usersData);
    } catch (err) {
      console.error(err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    if (!userId) return;

    const socket = io("http://localhost:5000");
    socket.on("connect", () => console.log("Connected to WebSocket server"));
    socket.on("expense_update", (data: { expenses: Expense[] }) => {
      console.log("Received expense update:", data);
      setExpenses((prev) => {
        const newExpenses = data.expenses.filter(
          (newExpense) => !prev.find((e) => e._id === newExpense._id)
        );
        return [...prev, ...newExpenses];
      });
    });
    socket.on("connect_error", (err: Error) => {
      console.log(`connect_error: ${err.message}`);
    });
    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return { expenses, users, loading, error };
};

export default useExpenseDashboard;