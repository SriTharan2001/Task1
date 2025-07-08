import React, { useState, useEffect } from "react";
import { Edit, Trash2, Save, X } from "lucide-react";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";
import { expenseService } from "../Service/expenseService";
import "../Css/ExpenseListDesign.css";
import { fetchExpenses } from "../Service/expenseApi";
import type { Expense } from "../Types/Expense";
import axios from "axios";

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
        const data = await fetchExpenses(userId);
        if (!Array.isArray(data)) {
          throw new Error("API did not return an array.");
        }
        setExpenses(data);
        setError(null);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch expenses.";
        console.error("Error fetching expenses:", err);
        setError(errorMessage);
      }
    };
    fetchExpensesData();
  }, []);

  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = expense.date
      ? new Date(expense.date).toISOString().split("T")[0]
      : "";
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
    setEditDate(
      expense.date
        ? new Date(expense.date).toISOString().split("T")[0]
        : ""
    );
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

      await axios.put(`http://localhost:5000/api/expenses/${id}`, payload);

      setExpenses((prev) =>
        prev.map((exp) =>
          exp._id === id ? { ...exp, ...payload } : exp
        )
      );
      cancelEdit();
      setError(null);
    } catch (err) {
      console.error("Error updating expense:", err);
      setError("Failed to update expense.");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );
    if (!confirmDelete) return;
    try {
      const userId = localStorage.getItem("userId") || "";
      await expenseService.deleteExpense(id, userId);
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
      setError(null);
    } catch (err) {
      console.error("Error deleting expense:", err);
      setError("Failed to delete expense.");
    }
  };

  // DataTable columns
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
            style={{ width: "100%", padding: "8px" }}
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
            style={{ width: "100%", padding: "8px" }}
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
            className="expense-edit-date-input"
            title="Edit date"
            placeholder="Edit date"
          />
        ) : (
          row.date ? new Date(row.date).toLocaleDateString("en-IN") : "N/A"
        ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div style={{ display: "flex", gap: "8px" }}>
          {editExpenseId === row._id ? (
            <>
              <button
                onClick={() => saveEdit(row._id)}
                title="Save"
                aria-label="Save"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Save size={20} />
              </button>
              <button
                onClick={cancelEdit}
                title="Cancel"
                aria-label="Cancel"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEdit(row)}
                title="Edit"
                aria-label="Edit"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => handleDelete(row._id)}
                title="Delete"
                aria-label="Delete"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Trash2 size={20} />
              </button>
            </>
          )}
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  const customStyles = {
    table: {
      style: {
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        overflow: "hidden",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#1e3a8a",
        color: "#fff",
        fontWeight: "bold",
      },
    },
    rows: {
      style: {
        minHeight: "56px",
        "&:hover": {
          backgroundColor: "#f1f5f9",
        },
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #d1d5db",
        padding: "10px",
      },
    },
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            border: "1px solid #fca5a5",
            color: "#b91c1c",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            position: "relative",
          }}
        >
          <strong style={{ marginRight: "8px" }}>Error:</strong>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#dc2626",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#1f2937",
          marginBottom: "24px",
        }}
      >
        Expense List
      </h2>

      <div
        style={{
          marginBottom: "24px",
          backgroundColor: "#f1f5f9",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "flex-end",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label
            htmlFor="category-filter"
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "500",
              color: "#1f2937",
            }}
          >
            Filter by Category
          </label>
          <input
            id="category-filter"
            type="text"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Category"
            style={{
              width: "80%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "1rem",
              
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label
            htmlFor="date-filter"
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "500",
              color: "#1f2937",
            }}
          >
            Filter by Date
          </label>
          <input
            id="date-filter"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              width: "80%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "1rem",
            }}
          />
        </div>
        <button
          onClick={resetFilters}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            fontSize: "1rem",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          Reset
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredExpenses}
        pagination
        paginationPerPage={10}
        paginationRowsPerPageOptions={[10, 25, 50]}
        customStyles={customStyles}
        noDataComponent="No expenses found."
        responsive
      />
    </div>
  );
};

export default ExpenseListDesign;