import React from "react";
import useExpenseForm from "../Hooks/useExpenseForm";

const ExpenseFormDesign: React.FC = () => {
  const {
    formData,
    handleChange,
    handleSubmit,
    successMessage,
    resetForm,
  } = useExpenseForm();

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-extrabold tracking-wider text-gray-800 mb-6">
        Add Expense
      </h2>

      {successMessage && (
        <div className="mb-4 text-green-600 font-semibold">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-semibold">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter category"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-semibold">Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
            step="0.01"
            min="0.01"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2 font-semibold">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Select date"
            required
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Add Expense
          </button>
          <button
            type="reset"
            onClick={resetForm}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-xl transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseFormDesign;
