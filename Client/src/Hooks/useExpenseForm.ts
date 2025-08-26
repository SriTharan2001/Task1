import { useState } from "react";
import { expenseService } from "../Service/expenseService";

export interface ExpenseFormData {
  category: string;
  amount: number;
  date: string;
  userId: string;
  title: string;
}

const useExpenseForm = (userId: string) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: "",
    amount: 0,
    date: "",
    userId: userId,
    title: "Expense",  // default title
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      userId: userId, // Ensure userId is always current
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      alert("User ID is required. Please log in.");
      return;
    }

    if (!formData.category.trim()) {
      setCategoryError("Category is required");
      return;
    } else {
      setCategoryError("");
    }

    if (!formData.amount || formData.amount <= 0) {
      alert("Amount must be a positive number");
      return;
    }

    if (!formData.date) {
      alert("Date is required");
      return;
    }

    if (isNaN(new Date(formData.date).getTime())) {
      alert("Invalid date");
      return;
    }

    try {
      await expenseService.createExpense({
        category: formData.category.trim(),
        amount: formData.amount,
        date: formData.date,
        userId: userId,
        title: "Expense",
      });

      setSuccessMessage("Expense added successfully!");
      setFormData({ category: "", amount: 0, date: "", userId: userId, title: "Expense" });

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: unknown) {
      console.error("Expense API Error:", error);
      if (error instanceof Error) {
        alert(`Expense API Error: ${error.message || "Something went wrong."}`);
      } else {
        alert("Something went wrong.");
      }
    }
  };

  const resetForm = () => {
    setFormData({ category: "", amount: 0, date: "", userId: userId, title: "Expense" });
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    successMessage,
    resetForm,
    categoryError,
  };
};


export default useExpenseForm;
