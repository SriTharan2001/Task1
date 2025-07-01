// src/Hooks/useExpenseDashboard.ts
import { useEffect, useState } from "react";
import type { Expense } from "../Types/Expense";
import type { User } from "../Types/User";
import { BASE_URL } from "../config";
import useStore from "pulsy";
import type { LoginResponse } from "./useLogin";
import { io } from 'socket.io-client';

const useExpenseDashboard = () => {
  const [auth] = useStore<LoginResponse>("auth");
  const userId = auth?.user?.objectId;
console.log("hey",auth?.user?.objectId);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchExpenses = async () => {
    try {
      const expensesRes = await fetch(`${BASE_URL}/expenses/fetch/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const usersRes = await fetch(`${BASE_URL}/users`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!expensesRes.ok) throw new Error("Failed to fetch expenses");
      if (!usersRes.ok) throw new Error("Failed to fetch users");

      const expensesData = await expensesRes.json();
      const usersData = await usersRes.json();

      setExpenses(expensesData);
      setUsers(usersData);
    } catch (err: unknown) {
      console.error(err);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      if (initialLoad) {
        fetchExpenses();
        setInitialLoad(false);
      }
    } else {
      setLoading(false);
      setError("User ID not found");
    }

    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    interface ExpenseUpdate {
      expenses: Expense[];
    }

    socket.on("expense_update", (data: ExpenseUpdate) => {
      console.log("Received expense update:", data);
      setExpenses((prevExpenses) => {
        // Merge the new expenses with the existing ones, avoiding duplicates
        const newExpenses = data.expenses.filter(
          (newExpense) =>
            !prevExpenses.find((existingExpense) => existingExpense._id === newExpense._id)
        );
        return [...prevExpenses, ...newExpenses];
      });
    });

    socket.on("connect_error", (err: unknown) => {
      console.log(`connect_error due to ${(err as Error).message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return { expenses, users, loading, error };
};

export default useExpenseDashboard;
