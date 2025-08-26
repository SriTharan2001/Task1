import { useEffect, useState } from "react";
import { BASE_URL } from "../config";

interface ExpenseCounters {
  total: number;
  monthly: number;
  daily: number;
}

const useExpenseCounters = () => {
  const [data, setData] = useState<ExpenseCounters | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dailyRes, monthlyRes, totalRes] = await Promise.all([
          fetch(`${BASE_URL}/api/expenses/daily`),
          fetch(`${BASE_URL}/api/expenses/monthly`),
          fetch(`${BASE_URL}/api/expenses/total`),
        ]);

        if (!dailyRes.ok || !monthlyRes.ok || !totalRes.ok) {
          throw new Error("Failed to fetch counters");
        }

        const dailyData = await dailyRes.json();
        const monthlyData = await monthlyRes.json();
        const totalData = await totalRes.json();

        setData({
          daily: dailyData.total ?? 0,
          monthly: monthlyData.total ?? 0,
          total: totalData.total ?? 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export default useExpenseCounters;