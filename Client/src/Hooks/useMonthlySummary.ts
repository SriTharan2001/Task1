import { useEffect, useState } from "react";

export type SummaryData = {
  month: string;
  total: number;
};

const useMonthlySummary = () => {
  const [summary, setSummary] = useState<SummaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/expenses/summary");
      const data = await res.json();
      setSummary(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load summary");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return { summary, loading, error, retry: fetchSummary };
};

export default useMonthlySummary;
