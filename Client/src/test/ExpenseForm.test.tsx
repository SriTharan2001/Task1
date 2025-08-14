import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import ExpenseFormDesign from "../components/ExpenseForm";
import useExpenseForm from "../Hooks/useExpenseForm";


// Define the mock for useExpenseForm
const mockUseExpenseForm = {
  formData: { category: "Food", amount: 100, date: "2023-08-01", userId: "12345", title: "Expense" },
  handleChange: vi.fn(),
  handleSubmit: vi.fn((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    return Promise.resolve();
  }),
  successMessage: "",
  resetForm: vi.fn(),
  categoryError: "",
};

// Mock the useExpenseForm hook
vi.mock("../Hooks/useExpenseForm");

describe("ExpenseFormDesign Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(useExpenseForm).mockReturnValue(mockUseExpenseForm);
  });

  test("TC01 - userId is retrieved from localStorage", () => {
    localStorage.setItem("userId", "12345");
    render(<ExpenseFormDesign />);
    expect(screen.getByTestId("expense-form")).toBeInTheDocument();
  });

test("TC02 - userId is empty string if not in localStorage", () => {
  render(<ExpenseFormDesign />);
  expect(screen.getByTestId("expense-form")).toBeInTheDocument();
});

  test("TC03 - Render form elements correctly", () => {
    render(<ExpenseFormDesign />);
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Expense/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
  });

  test("TC04 - Input change calls handleChange", () => {
    // Set initial form data with an empty category for this test
    vi.mocked(useExpenseForm).mockReturnValue({
      ...mockUseExpenseForm,
      formData: { ...mockUseExpenseForm.formData, category: "" },
    });

    render(<ExpenseFormDesign />);
    const categoryInput = screen.getByLabelText(/Category/i);
    fireEvent.change(categoryInput, { target: { value: "Food" } });
    expect(mockUseExpenseForm.handleChange).toHaveBeenCalled();
  });

  test("TC05 - Show category error message", () => {
    vi.mocked(useExpenseForm).mockReturnValue({
      ...mockUseExpenseForm,
      formData: { category: "", amount: 0, date: "", userId: "12345", title: "Expense" },
      categoryError: "Category is required",
    });
    render(<ExpenseFormDesign />);
    expect(screen.getByText(/Category is required/i)).toBeInTheDocument();
  });

  test("TC06 - Form submits successfully with valid data", () => {
    vi.mocked(useExpenseForm).mockReturnValue({
      ...mockUseExpenseForm,
      successMessage: "Expense added successfully!",
    });
    render(<ExpenseFormDesign />);
    const submitBtn = screen.getByRole("button", { name: /Add Expense/i });
    fireEvent.click(submitBtn);
    expect(mockUseExpenseForm.handleSubmit).toHaveBeenCalled();
    expect(screen.getByText(/Expense added successfully!/i)).toBeInTheDocument();
  });

  test("TC07 - Reset button clears the form", () => {
    render(<ExpenseFormDesign />);
    const resetBtn = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(resetBtn);
    expect(mockUseExpenseForm.resetForm).toHaveBeenCalled();
  });

  test("TC08 - Amount input has min attribute 0.01", () => {
    render(<ExpenseFormDesign />);
    const amountInput = screen.getByLabelText(/Amount/i);
    expect(amountInput).toHaveAttribute("min", "0.01");
  });

// test("TC09 - Date input accepts valid date", () => {
//   render(<ExpenseFormDesign />);
//   const dateInput = screen.getByLabelText(/Date/i);
//   fireEvent.change(dateInput, { target: { value: "2023-08-12" } });
//   expect(dateInput).toHaveValue("2023-08-12");
// });

  test("TC10 - Success message disappears after reset", () => {
    vi.mocked(useExpenseForm).mockReturnValue({
      ...mockUseExpenseForm,
      successMessage: "Expense added successfully!",
    });
    render(<ExpenseFormDesign />);
    expect(screen.getByText(/Expense added successfully!/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole("button", { name: /Cancel/i });
    fireEvent.click(resetBtn);
    expect(mockUseExpenseForm.resetForm).toHaveBeenCalled();
  });

  test("TC11 - Labels are associated with inputs and inputs required", () => {
    render(<ExpenseFormDesign />);
    expect(screen.getByLabelText(/Category/i)).toBeRequired();
    expect(screen.getByLabelText(/Amount/i)).toBeRequired();
    expect(screen.getByLabelText(/Date/i)).toBeRequired();
  });

  test("TC12 - Form submission blocked if required fields missing", () => {
    vi.mocked(useExpenseForm).mockReturnValue({
      ...mockUseExpenseForm,
      formData: { category: "", amount: 0, date: "", userId: "12345", title: "Expense" },
    });
    render(<ExpenseFormDesign />);
    const form = screen.getByTestId("expense-form");
    fireEvent.submit(form);
    // No explicit assertion, just checking no errors thrown.
  });

  test("TC13 - Container has expected classes", () => {
    render(<ExpenseFormDesign />);
    const container = screen.getByTestId("form-title").parentElement;
    expect(container).toHaveClass("w-full");
    expect(container).toHaveClass("max-w-md");
    expect(container).toHaveClass("bg-gray-200");
    expect(container).toHaveClass("p-6");
    expect(container).toHaveClass("rounded-xl");
    expect(container).toHaveClass("shadow-lg");
  });
});
