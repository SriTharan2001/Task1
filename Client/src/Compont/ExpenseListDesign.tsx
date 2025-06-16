import React, { useState, useEffect } from "react";
import { Edit, Trash2, Save, X } from "lucide-react";
import { getExpenses, updateExpense, deleteExpense } from "../Service/expenseService.ts";
import type { Expense } from "../Types/Expense.ts";

const ExpenseListDesign: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    _id: string;
    title: string;
    category: string;
    amount: number;
    date: string;
  }>({
    _id: "",
    title: "",
    category: "",
    amount: 0,
    date: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpenses();
        setExpenses(data as Expense[]);
      } catch (error) {
        setError("Failed to fetch expenses.");
        console.error("Failed to fetch expenses:", error);
      }
    };
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesCategory = categoryFilter
      ? expense.category.toLowerCase().includes(categoryFilter.toLowerCase())
      : true;
    const matchesDate = dateFilter
      ? expense.date && new Date(expense.date).toISOString().split("T")[0] === dateFilter
      : true;
    return matchesCategory && matchesDate;
  });

  const resetFilters = () => {
    setCategoryFilter("");
    setDateFilter("");
  };

  const handleEdit = (expense: Expense) => {
    setEditId(expense._id);
    setEditForm({
      _id: expense._id,
      title: expense.title || '',
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateExpense(id, editForm);
      setExpenses((prevExpenses) =>
        prevExpenses.map((exp) => (exp._id === id ? { ...editForm, _id: id } : exp))
      );
      setEditId(null);
      setEditForm({ _id: "", title: "", category: "", amount: 0, date: "" });
      setError(null);
    } catch (error) {
      setError("Failed to update expense.");
      console.error("Failed to update expense:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditForm({ _id: "", title: "", category: "", amount: 0, date: "" });
    setError(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses((prevExpenses) => prevExpenses.filter((exp) => exp._id !== id));
      setError(null);
    } catch (error) {
      setError("Failed to delete expense.");
      console.error("Failed to delete expense:", error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 sm:p-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
        Expense List
      </h2>

      {/* Filters */}
      <div className="mb-8 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-md space-y-6 sm:space-y-0 sm:flex sm:items-end sm:justify-between sm:gap-6">
        <div className="flex-1">
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
            Filter by Category
          </label>
          <input
            type="text"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Category"
            title="Edit category"
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
            Filter by Date
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            title="Filter by date"
          />
        </div>
        <button
          onClick={resetFilters}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-5 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 w-full sm:w-auto"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
                Category
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
                Amount (₹)
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
                Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) =>
              editId === expense._id ? (
                <tr key={expense._id} className="bg-yellow-50 dark:bg-yellow-900">
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) =>
                        setEditForm({ ...editForm, category: e.target.value })
                      }
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                      placeholder="Enter category"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) =>
                        setEditForm({ ...editForm, amount: Number(e.target.value) })
                      }
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                      placeholder="Enter amount"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) =>
                        setEditForm({ ...editForm, date: e.target.value })
                      }
                      className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                      placeholder="Enter date"
                    />
                  </td>
                  <td className="px-6 py-4 flex gap-4 items-center">
                    <button
                      onClick={() => handleSaveEdit(expense._id)}
                      className="p-2 rounded-full text-green-500 hover:bg-green-100 dark:hover:bg-green-900 transition"
                      title="Save Expense"
                    >
                      <Save size={20} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                      title="Cancel"
                    >
                      <X size={20} />
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                    ₹{Number(expense.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-200">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-4 items-center">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-2 rounded-full text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900 transition"
                      title="Edit Expense"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition"
                      title="Delete Expense"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default ExpenseListDesign;
