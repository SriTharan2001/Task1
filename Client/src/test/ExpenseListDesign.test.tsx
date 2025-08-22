// ExpenseListDesign.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExpenseListDesign from "../components/ExpenseListDesign";
import api from "../utils/api";
import type { Expense } from "../Types/Expense";
import { vi } from 'vitest';

interface AxiosRequestConfig {
  headers?: Record<string, string>;
  url: string;
}

vi.mock('../utils/api');

const mockExpenses: Expense[] = [
  { _id: "1", objectId: "obj1", category: "Food", amount: 500, date: "2025-08-01" },
  { _id: "2", objectId: "obj2", category: "Transport", amount: 300, date: "2025-08-02" },
];

describe("ExpenseListDesign Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("userId", "user123");
  });

  test("1. Renders rows when API returns array", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockExpenses,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: '' } as AxiosRequestConfig,
    });
    render(<ExpenseListDesign />);
    await waitFor(() => expect(screen.getByText("Food")).toBeInTheDocument());
    expect(screen.getByText("Transport")).toBeInTheDocument();
  });

  test("2. Shows 'No expenses found.' for empty array", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: [],
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: '' } as AxiosRequestConfig,
    });
    render(<ExpenseListDesign />);
    await waitFor(() => expect(screen.getByText("No expenses found.")).toBeInTheDocument());
  });

  test("3. Shows error if API fails", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("API error"));
    render(<ExpenseListDesign />);
    await waitFor(() => expect(screen.getByText(/Failed to fetch expenses/i)).toBeInTheDocument());
  });

  test("4. Shows error if no userId", () => {
    localStorage.removeItem("userId");
    render(<ExpenseListDesign />);
    expect(screen.getByText("User ID not found. Please login.")).toBeInTheDocument();
  });

  test("5 & 6. Filters by category", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockExpenses,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: '' } as AxiosRequestConfig,
    });
    render(<ExpenseListDesign />);
    await waitFor(() => expect(screen.getByText("Food")).toBeInTheDocument());

    // Match some rows
    fireEvent.change(screen.getByPlaceholderText("Category"), { target: { value: "Food" } });
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.queryByText("Transport")).toBeNull();

    // Match no rows
    fireEvent.change(screen.getByPlaceholderText("Category"), { target: { value: "xyz" } });
    expect(screen.getByText("No expenses found.")).toBeInTheDocument();
  });

  test("7 & 8. Filters by date", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockExpenses,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: '' } as AxiosRequestConfig,
    });
    render(<ExpenseListDesign />);
    await waitFor(() => screen.getByText("Food"));

    fireEvent.change(screen.getByLabelText("Filter by date"), { target: { value: "2025-08-01" } });
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.queryByText("Transport")).toBeNull();

    fireEvent.change(screen.getByLabelText("Filter by date"), { target: { value: "2025-09-01" } });
    expect(screen.getByText("No expenses found.")).toBeInTheDocument();
  });

  test("9. Filters by category & date combined", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockExpenses,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: '' } as AxiosRequestConfig,
    });
    render(<ExpenseListDesign />);
    await waitFor(() => screen.getByText("Food"));

    fireEvent.change(screen.getByPlaceholderText("Category"), { target: { value: "Food" } });
    fireEvent.change(screen.getByLabelText("Filter by date"), { target: { value: "2025-08-01" } });
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.queryByText("Transport")).toBeNull();
  });

  test("10. Reset filters", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockExpenses,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: '' } as AxiosRequestConfig,
    });
    render(<ExpenseListDesign />);
    await waitFor(() => screen.getByText("Food"));

    fireEvent.change(screen.getByPlaceholderText("Category"), { target: { value: "Food" } });
    fireEvent.click(screen.getByText("Reset"));
    expect(screen.getByPlaceholderText("Category")).toHaveValue("");
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Transport")).toBeInTheDocument();
  });

  test("11. Click edit on row", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockExpenses,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: '' } as AxiosRequestConfig,
    });
    render(<ExpenseListDesign />);
    await waitFor(() => screen.getByText("Food"));

    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    expect(screen.getByDisplayValue("Food")).toBeInTheDocument();
    expect(screen.getByDisplayValue("500")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2025-08-01")).toBeInTheDocument();
  });

  test("12. Cancel edit returns to normal view", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockExpenses,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: '' } as AxiosRequestConfig,
    });
    render(<ExpenseListDesign />);
    await waitFor(() => screen.getByText("Food"));

    fireEvent.click(screen.getAllByTitle("Edit")[0]);
    fireEvent.click(screen.getByTitle("Cancel"));
    expect(screen.getByText("Food")).toBeInTheDocument();
  });

  test("13 & 14 & 15. Save edit success & validation & failure", async () => {
  // Mock GET for initial data
  vi.mocked(api.get).mockResolvedValue({
    data: mockExpenses,
    status: 200,
    statusText: "OK",
    headers: {},
    config: { url: "" } as AxiosRequestConfig,
  });

  // Mock PUT for initial successful edit
  vi.mocked(api.put).mockResolvedValue({
    data: {},
    status: 200,
    statusText: "OK",
    headers: {},
    config: { url: "" } as AxiosRequestConfig,
  });

  render(<ExpenseListDesign />);

  // Wait for expenses to render
  await waitFor(() => screen.getByText("Food"));

  // === SUCCESSFUL EDIT ===
  fireEvent.click(screen.getAllByTitle("Edit")[0]);
  fireEvent.change(screen.getByDisplayValue("Food"), { target: { value: "Groceries" } });
  fireEvent.change(screen.getByDisplayValue("500"), { target: { value: "600" } });
  fireEvent.change(screen.getByDisplayValue("2025-08-01"), { target: { value: "2025-08-03" } });
  fireEvent.click(screen.getByTitle("Save"));

  await waitFor(() => screen.getByText("Groceries"));

  // === VALIDATION FAILURE ===
  fireEvent.click(screen.getAllByTitle("Edit")[0]);
  fireEvent.change(screen.getByDisplayValue("Groceries"), { target: { value: "" } });
  fireEvent.click(screen.getByTitle("Save"));
  expect(screen.getByText(/All fields are required/i)).toBeInTheDocument();

  // === API FAILURE ===
  vi.mocked(api.put).mockRejectedValue(new Error("Fail"));

  // The component should still be in edit mode after a validation error.
  // We need to find the specific input that is now empty.
  // The other empty inputs are the filters. The one we want is inside the table row.
  // Let's find all inputs with empty value and assume the last one is the one in our editable row.
  const inputs = screen.getAllByDisplayValue("");
  const categoryInput = inputs[inputs.length - 1];

  fireEvent.change(categoryInput, { target: { value: "Groceries" } });
  fireEvent.change(screen.getByDisplayValue("600"), { target: { value: "700" } });
  fireEvent.change(screen.getByDisplayValue("2025-08-03"), { target: { value: "2025-08-04" } });
  fireEvent.click(screen.getByTitle("Save"));

  await waitFor(() => screen.getByText(/Failed to update expense/i));
});


  test("16 & 17 & 18. Delete row confirmed/cancel/failure", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockExpenses,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: '' } as AxiosRequestConfig,
    });
    vi.mocked(api.delete).mockResolvedValue({
      data: {},
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: '' } as AxiosRequestConfig,
    });
    render(<ExpenseListDesign />);
    await waitFor(() => screen.getByText("Food"));

    // Mock confirm true
    window.confirm = vi.fn(() => true);
    fireEvent.click(screen.getAllByTitle("Delete")[0]);
    await waitFor(() => expect(screen.queryByText("Food")).toBeNull());

    // Mock confirm false
    window.confirm = vi.fn(() => false);
    fireEvent.click(screen.getAllByTitle("Delete")[0]);
    expect(screen.getByText("Transport")).toBeInTheDocument();

    // Delete API failure
    window.confirm = vi.fn(() => true);
    vi.mocked(api.delete).mockRejectedValue(new Error("Fail"));
    fireEvent.click(screen.getAllByTitle("Delete")[0]);
    await waitFor(() => screen.getByText(/Failed to delete expense/i));
  });

  test("19. Row with missing date displays N/A", async () => {
    const data = [{ _id: "3", category: "Misc", amount: 100, date: undefined }];
    vi.mocked(api.get).mockResolvedValue({
      data,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: '' } as AxiosRequestConfig,
    });
    render(<ExpenseListDesign />);
    await waitFor(() => screen.getByText("N/A"));
  });

  test("20. Amount is formatted correctly", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: mockExpenses,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { url: '' } as AxiosRequestConfig,
    });
    render(<ExpenseListDesign />);
    await waitFor(() => screen.getByText("₹500"));
    expect(screen.getByText("₹500")).toBeInTheDocument();
  });
});
