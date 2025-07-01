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
    setLoading(true);
    setError(null);

    try {
const res = await fetch("http://localhost:5000/api/summary/summary");
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      setError("Failed to load summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return { summary, loading, error, retry: fetchSummary };
};

export default useMonthlySummary;
