// src/Hooks/useCategoryExpenses.ts
import { useEffect, useState } from "react";
import { BASE_URL } from "../config";

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
        const response = await fetch(`${BASE_URL}/api/expenses/category-wise`);
        if (!response.ok) throw new Error("Failed to fetch category data");
        const result = await response.json();
        setData(result);
      } catch (err) {
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