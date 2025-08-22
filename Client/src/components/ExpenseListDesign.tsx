import React, { useState, useEffect } from "react";
import { Edit, Trash2, Save, X } from "lucide-react";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import type { Expense } from "../Types/Expense";
import api from "../utils/api";

const ExpenseListDesign: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editExpenseId, setEditExpenseId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");

  useEffect(() => {
    const fetchExpensesData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setError("User ID not found. Please login.");
          return;
        }
        const response = await api.get(`/api/expenses/fetch/${userId}`);
        const data = response.data;
        if (Array.isArray(data)) {
          setExpenses(data);
        } else {
          setExpenses([]);
          setError("Unexpected response from server.");
        }
      } catch (err: unknown) {
        console.error("Error fetching expenses:", err);
        if (typeof err === "object" && err !== null && "response" in err) {
          const response = (err as { response?: { data?: { message?: string } } }).response;
          setError(response?.data?.message || "Failed to fetch expenses.");
        } else {
          setError("Failed to fetch expenses.");
        }
      }
    };
    fetchExpensesData();
  }, []);

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = expense.date ? new Date(expense.date).toISOString().split("T")[0] : "";
    const matchCategory = categoryFilter
      ? expense.category.toLowerCase().includes(categoryFilter.toLowerCase())
      : true;
    const matchDate = dateFilter ? expenseDate === dateFilter : true;
    return matchCategory && matchDate;
  });

  const resetFilters = () => {
    setCategoryFilter("");
    setDateFilter("");
    setError(null);
  };

  const startEdit = (expense: Expense) => {
    setEditExpenseId(expense._id);
    setEditCategory(expense.category);
    setEditAmount(expense.amount.toString());
    setEditDate(expense.date ? new Date(expense.date).toISOString().split("T")[0] : "");
    setError(null);
  };

  const cancelEdit = () => {
    setEditExpenseId(null);
    setEditCategory("");
    setEditAmount("");
    setEditDate("");
    setError(null);
  };

  const saveEdit = async (id: string) => {
    setError(null); // fix: clear old error before saving
    try {
      if (!editCategory.trim() || !editAmount || !editDate) {
        setError("All fields are required.");
        return;
      }
      const payload = {
        category: editCategory.trim(),
        amount: parseFloat(editAmount),
        date: editDate,
      };
      await api.put(`/api/expenses/${id}`, payload);
      setExpenses((prev) =>
        prev.map((exp) => (exp._id === id ? { ...exp, ...payload } : exp))
      );
      cancelEdit();
    } catch {
      setError("Failed to update expense.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.delete(`/api/expenses/${id}`);
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
      setError(null);
    } catch {
      setError("Failed to delete expense.");
    }
  };

  const columns: TableColumn<Expense>[] = [
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      cell: (row) =>
        editExpenseId === row._id ? (
          <input
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            placeholder="Edit category"
            className="w-full p-2 border rounded"
          />
        ) : (
          row.category
        ),
    },
    {
      name: "Amount (RS)",
      selector: (row) => row.amount,
      sortable: true,
      cell: (row) =>
        editExpenseId === row._id ? (
          <input
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            placeholder="Edit amount"
            className="w-full p-2 border rounded"
          />
        ) : (
          `₹${row.amount.toLocaleString("en-IN")}`
        ),
    },
    {
      name: "Date",
      selector: (row) => row.date ?? "",
      sortable: true,
      cell: (row) =>
        editExpenseId === row._id ? (
          <input
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Edit date"
            title="Edit date"
          />
        ) : (
          row.date ? new Date(row.date).toLocaleDateString("en-IN") : "N/A"
        ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          {editExpenseId === row._id ? (
            <>
              <button onClick={() => saveEdit(row._id)} title="Save" className="text-blue-900"><Save size={20} /></button>
              <button onClick={cancelEdit} title="Cancel" className="text-red-800"><X size={20} /></button>
            </>
          ) : (
            <>
              <button onClick={() => startEdit(row)} title="Edit" className="text-blue-900"><Edit size={20} /></button>
              <button onClick={() => handleDelete(row._id)} title="Delete" className="text-red-800"><Trash2 size={20} /></button>
            </>
          )}
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  return (
    <div className="font-sans max-w-screen-xl mx-auto p-6">
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold mr-2">Error:</strong>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-2 right-2"
            title="Close error"
            aria-label="Close error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Expense List</h2>

      <div className="bg-gray-200 rounded-lg p-5 flex flex-wrap gap-4 mb-6 shadow">
        <div className="flex-1 min-w-[200px]">
  <label className="block mb-1 font-medium text-gray-700" htmlFor="category-filter">
    Filter by Category
  </label>
  <input
    id="category-filter"
    aria-label="Filter by category"
    type="text"
    value={categoryFilter}
    onChange={(e) => setCategoryFilter(e.target.value)}
    placeholder="Category"
    className="w-full p-2 border rounded"
  />
</div>

<div className="flex-1 min-w-[200px]">
  <label className="block mb-1 font-medium text-gray-700" htmlFor="date-filter">
    Filter by Date
  </label>
  <input
    id="date-filter"
    aria-label="Filter by date"
    type="date"
    value={dateFilter}
    onChange={(e) => setDateFilter(e.target.value)}
    className="w-full p-2 border rounded"
  />
</div>

        <button onClick={resetFilters} className="bg-yellow-500 h-11 text-white px-4 py-2 mt-7 rounded font-medium hover:bg-yellow-600">
          Reset
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredExpenses}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 25, 50]}
        noDataComponent="No expenses found."
        responsive
        className="bg-gray-200 font-sans"
      />
    </div>
  );
};

export default ExpenseListDesign;
