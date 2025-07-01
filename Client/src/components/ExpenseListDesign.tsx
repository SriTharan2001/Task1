// ExpenseListDesign.tsx
import React, { useState, useEffect } from "react";
import { Edit, Trash2, Save, X } from "lucide-react";
import { expenseService } from "../Service/expenseService";
import "../Css/ExpenseListDesign.css";
import { fetchExpenses } from "../Service/expenseApi";
import type { Expense } from "../Types/Expense";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpensesData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          navigate("/login");
          return;
        }
        const data = await fetchExpenses(userId);
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
  }, [navigate]);

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

      console.log("Sending update payload:", payload);

      await axios.put(`http://localhost:5000/api/expenses/${id}`, payload);

      setExpenses((prev) =>
        prev.map((exp) =>
          exp._id === id
            ? { ...exp, ...payload }
            : exp
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
      await expenseService.deleteExpense(id, "654e3d8a4a7a4f9b8b7b7b7b");
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
      setError(null);
    } catch (err) {
      console.error("Error deleting expense:", err);
      setError("Failed to delete expense.");
    }
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

      <h2 style={{ fontSize: "2rem", fontWeight: "bold", color: "#1f2937", marginBottom: "24px" }}>
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
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "1rem",
        outline: "none",
        transition: "border-color 0.2s",
      }}
      onFocus={(e) =>
        (e.target.style.borderColor = "#2563eb")
      }
      onBlur={(e) =>
        (e.target.style.borderColor = "#d1d5db")
      }
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
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        fontSize: "1rem",
        outline: "none",
        transition: "border-color 0.2s",
      }}
      onFocus={(e) =>
        (e.target.style.borderColor = "#2563eb")
      }
      onBlur={(e) =>
        (e.target.style.borderColor = "#d1d5db")
      }
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
      transition: "background-color 0.2s",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.backgroundColor = "#1d4ed8")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.backgroundColor = "#2563eb")
    }
  >
    Reset
  </button>
</div>


      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#1e3a8a", color: "#fff" }}>
            <th>Category</th>
            <th>Amount (₹)</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", padding: "16px" }}>
                No expenses found.
              </td>
            </tr>
          ) : (
            filteredExpenses.map((expense) => (
              <tr key={expense._id}>
                <td>
                  {editExpenseId === expense._id ? (
                    <input
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      placeholder="Edit category"
                      title="Edit category"
                    />
                  ) : (
                    expense.category
                  )}
                </td>
                <td>
                  {editExpenseId === expense._id ? (
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="Edit amount"
                      title="Edit amount"
                    />
                  ) : (
                    `₹${expense.amount.toLocaleString("en-IN")}`
                  )}
                </td>
                <td>
                  {editExpenseId === expense._id ? (
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      placeholder="Edit date"
                      title="Edit date"
                    />
                  ) : (
                    expense.date
                      ? new Date(expense.date).toLocaleDateString("en-IN")
                      : "N/A"
                  )}
                </td>
                <td style={{ display: "flex", gap: "8px" }}>
                  {editExpenseId === expense._id ? (
                    <>
                      <button onClick={() => saveEdit(expense._id)} title="Save">
                        <Save size={20} />
                      </button>
                      <button onClick={cancelEdit} title="Cancel">
                        <X size={20} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(expense)} title="Edit">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => handleDelete(expense._id)} title="Delete">
                        <Trash2 size={20} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseListDesign;
