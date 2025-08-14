import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useStore from "pulsy";
import type { Expense } from "../Types/Expense";
import type { User } from "../Types/User";
import type { LoginResponse } from "../Types/LoginResponse";
import api from "../utils/api"; // ✅ Axios instance

const useExpenseDashboard = () => {
  const [auth] = useStore<LoginResponse>("auth");
  const userId = auth?.user?.objectId;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    if (!userId) {
      setLoading(false);
      setError("User ID not found");
      console.warn("🚫 No userId found in auth state.");
      return;
    }

    try {
      const [expensesRes, usersRes] = await Promise.all([
        api.get(`/api/expenses/fetch/${userId}`), // ✅ Protected
        api.get(`/api/auth/users`),               // ✅ Protected
      ]);

      setExpenses(expensesRes.data as Expense[]);
      setUsers(usersRes.data as User[]);

      console.log("📦 Expenses:", expensesRes.data);
      console.log("👥 Users:", usersRes.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("❌ Error fetching dashboard data:", err.message);
      } else {
        console.error("❌ Error fetching dashboard data:", err);
      }
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchExpenses();

    const token = localStorage.getItem("token");
    console.log("📡 Connecting socket with token:", token);

    const socket = io("http://localhost:5000", {
      auth: {
        token: token || "",
      },
    });

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");
    });

    socket.on("disconnect", () => {
      console.warn("⚠️ Disconnected from WebSocket");
    });

    socket.on("expense_update", (data: { expenses: Expense[] }) => {
      console.log("📩 Received expense update:", data);

      setExpenses((prev) => {
        const newExpenses = data.expenses.filter(
          (newExpense) => !prev.find((e) => e._id === newExpense._id)
        );
        return [...prev, ...newExpenses];
      });
    });

    socket.on("connect_error", (err: Error) => {
      console.error("❌ Socket connect error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return { expenses, users, loading, error };
};

export default useExpenseDashboard;
