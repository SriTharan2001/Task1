import React, { useEffect, useState } from "react";
import useExpenseForm from "../Hooks/useExpenseForm";

const ExpenseFormDesign: React.FC = () => {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId || "");
  }, []);

  const {
    formData,
    handleChange,
    handleSubmit,
    successMessage,
    resetForm,
    categoryError,
  } = useExpenseForm(userId);

  return (
    <div className="w-full font-sans max-w-md mx-auto mt-10 bg-gray-200 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold tracking-wide text-gray-800 mb-6" data-testid="form-title">
        Add Expense
      </h2>

      {successMessage && (
        <div className="mb-4 text-green-600 font-semibold">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 w-full" data-testid="expense-form">
        {/* Category Field */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1">
            Category
          </label>
          <input
            id="category"
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Enter category"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {categoryError && (
            <p className="text-sm text-red-500 mt-1">{categoryError}</p>
          )}
        </div>

        {/* Amount Field */}
        <div>
          <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-1">
            Amount (RS)
          </label>
          <input
            id="amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            step="0.01"
            min="0.01"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Date Field */}
        <div>
          <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-1">
            Date
          </label>
          <input
            id="date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            title="Select date"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition hover:from-blue-600 hover:to-indigo-600 hover:scale-105 shadow-sm"
          >
            Add Expense
          </button>
          <button
            type="reset"
            onClick={resetForm}
            className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseFormDesign;
