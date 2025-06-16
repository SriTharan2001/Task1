import { useState } from "react";
import { createExpense } from "../Service/expenseApi";

export interface ExpenseFormData {
  category: string;
  amount: string;
  date: string;
}

const useExpenseForm = () => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: "",
    amount: "",
    date: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await createExpense({
        category: formData.category,
        amount: formData.amount,
        date: new Date(formData.date),
      });

      setSuccessMessage("Expense added successfully!");
      setFormData({ category: "", amount: "", date: "" });

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Expense API Error:", error);
      alert((error as Error).message || "Something went wrong.");
    }
  };

  const resetForm = () => {
    setFormData({ category: "", amount: "", date: "" });
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    successMessage,
    resetForm,
  };
};

export default useExpenseForm;
