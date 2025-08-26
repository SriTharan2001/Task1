// src/Hooks/useCategoryExpenses.ts
import { useEffect, useState } from "react";
import api from "../utils/api"; // ✅ Axios instance with token

interface CategoryData {
  name: string;
  value: number;
  count: number;
}

const useCategoryExpenses = () => {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<CategoryData[]>("/api/expenses/category-wise"); // ✅ token attached automatically
        setData(response.data);
      } catch (err: unknown) {
        console.error("❌ Error fetching category-wise expenses:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export default useCategoryExpenses;