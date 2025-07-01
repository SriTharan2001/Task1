export const createExpense = async (expense: { category: string; amount: number; date: string, userId: string }) => {
  const response = await fetch("http://localhost:5000/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create expense");
  }

  return response.json();
};

export const fetchExpenses = async (userId: string) => {
  const response = await fetch(`http://localhost:5000/api/expenses/fetch/${userId}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch expenses");
  }

  return response.json();
};
