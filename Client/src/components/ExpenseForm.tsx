import React, { useEffect } from "react";
import useExpenseForm from "../Hooks/useExpenseForm";
import { useNavigate } from "react-router-dom";

const ExpenseFormDesign: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = React.useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      navigate('/login');
      return;
    }
    setUserId(storedUserId);
  }, [navigate]);

  const {
    formData,
    handleChange,
    handleSubmit,
    successMessage,
    resetForm,
    categoryError,
  } = useExpenseForm(userId || '');

  if (!userId) {
    return <p>Loading...</p>;
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "28rem",
        margin: "0 auto",
        padding: "1.5rem",
        backgroundColor: "white",
        borderRadius: "0.75rem",
        boxShadow: "0 10px 15px rgba(0,0,0,0.1)"
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "800",
          letterSpacing: "0.05em",
          color: "#2d3748",
          marginBottom: "1.5rem"
        }}
      >
        Add Expense
      </h2>

      {successMessage && (
        <div
          style={{
            marginBottom: "1rem",
            color: "green",
            fontWeight: "600"
          }}
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              color: "#4a5568",
              marginBottom: "0.5rem",
              fontWeight: "600"
            }}
          >
            Category
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Enter category"
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "0.75rem",
              outline: "none"
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = "0 0 0 2px #3b82f6";
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "none";
            }}
          />
          {categoryError && (
            <p style={{ color: "#f56565", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {categoryError}
            </p>
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              color: "#4a5568",
              marginBottom: "0.5rem",
              fontWeight: "600"
            }}
          >
            Amount (₹)
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            step="0.01"
            min="0.01"
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "0.75rem",
              outline: "none"
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = "0 0 0 2px #3b82f6";
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{
              display: "block",
              color: "#4a5568",
              marginBottom: "0.5rem",
              fontWeight: "600"
            }}
          >
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            placeholder="Select date"
            required
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "0.75rem",
              outline: "none"
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = "0 0 0 2px #3b82f6";
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            style={{
              background: "linear-gradient(to right, #3b82f6, #6366f1)",
              color: "white",
              fontWeight: "600",
              padding: "0.5rem 1rem",
              borderRadius: "0.75rem",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "linear-gradient(to right, #2563eb, #4f46e5)";
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "linear-gradient(to right, #3b82f6, #6366f1)";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Add Expense
          </button>
          <button
            type="reset"
            onClick={resetForm}
            style={{
              backgroundColor: "#e2e8f0",
              color: "#2d3748",
              fontWeight: "600",
              padding: "0.5rem 1rem",
              borderRadius: "0.75rem",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#cbd5e0";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#e2e8f0";
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseFormDesign;
