// MonthlySummaryDesign.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, test, beforeEach, expect } from "vitest";
import MonthlySummaryDesign from "../components/MonthlySummary";
import useMonthlySummary from "../Hooks/useMonthlySummary";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ---- Mocks ----
vi.mock("../Hooks/useMonthlySummary", () => ({
  __esModule: true,
  default: vi.fn(),
}));

vi.mock("jspdf", () => {
  return {
    __esModule: true,
    default: vi.fn().mockImplementation(() => ({
      setFontSize: vi.fn(),
      text: vi.fn(),
      save: vi.fn(),
    })),
  };
});

vi.mock("jspdf-autotable", () => ({
  __esModule: true,
  default: vi.fn(),
}));

const mockedUseMonthlySummary = useMonthlySummary as unknown as ReturnType<
  typeof vi.fn
>;

describe("MonthlySummaryDesign", () => {
  const sampleSummary = [
    { month: "January", total: 1200 },
    { month: "February", total: 2500.5 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TC01 - Loading state
  test("TC01 - Loading state", () => {
    mockedUseMonthlySummary.mockReturnValue({
      summary: [],
      loading: true,
      error: null,
      retry: vi.fn(),
    });

    render(<MonthlySummaryDesign />);
    expect(screen.getByText(/Loading summary/i)).toBeInTheDocument();
  });

  // TC02 - Error state
  test("TC02 - Error state with retry button", () => {
    mockedUseMonthlySummary.mockReturnValue({
      summary: [],
      loading: false,
      error: "Failed to fetch",
      retry: vi.fn(),
    });

    render(<MonthlySummaryDesign />);
    expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    expect(screen.getByText(/Retry/i)).toBeInTheDocument();
  });

  // TC03 - Retry button click
  test("TC03 - Retry button click", () => {
    const retryMock = vi.fn();
    mockedUseMonthlySummary.mockReturnValue({
      summary: [],
      loading: false,
      error: "Failed to fetch",
      retry: retryMock,
    });

    render(<MonthlySummaryDesign />);
    fireEvent.click(screen.getByText(/Retry/i));
    expect(retryMock).toHaveBeenCalledTimes(1);
  });

  // TC04 - Summary table with data
  test("TC04 - Summary table with data", () => {
    mockedUseMonthlySummary.mockReturnValue({
      summary: sampleSummary,
      loading: false,
      error: null,
      retry: vi.fn(),
    });

    render(<MonthlySummaryDesign />);
    sampleSummary.forEach(({ month, total }) => {
      expect(screen.getByText(month)).toBeInTheDocument();
      expect(
        screen.getByText(
          `RS ${total.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        )
      ).toBeInTheDocument();
    });
  });

  // TC05 - No summary data
  test("TC05 - No summary data", () => {
    mockedUseMonthlySummary.mockReturnValue({
      summary: [],
      loading: false,
      error: null,
      retry: vi.fn(),
    });

    render(<MonthlySummaryDesign />);
    expect(screen.getByText(/No expenses found/i)).toBeInTheDocument();
  });

  // TC06 - PDF download
  test("TC06 - PDF download", () => {
    mockedUseMonthlySummary.mockReturnValue({
      summary: sampleSummary,
      loading: false,
      error: null,
      retry: vi.fn(),
    });

    render(<MonthlySummaryDesign />);
    fireEvent.click(screen.getByText(/Download PDF/i));

    expect(jsPDF).toHaveBeenCalled();
    expect(autoTable).toHaveBeenCalled();
    const mockedJsPDF = jsPDF as unknown as ReturnType<typeof vi.fn>;
    const docInstance = mockedJsPDF.mock.results[0].value;
    expect(docInstance.save).toHaveBeenCalledWith("monthly-summary.pdf");
  });

  // TC07 - Hover scroll arrows
  test("TC07 - Hover scroll arrows", () => {
    mockedUseMonthlySummary.mockReturnValue({
      summary: sampleSummary,
      loading: false,
      error: null,
      retry: vi.fn(),
    });

    render(<MonthlySummaryDesign />);

    const scrollContainer = screen.getByRole("table").parentElement!;
    expect(screen.queryByLabelText(/Scroll Up/i)).not.toBeInTheDocument();

    fireEvent.mouseEnter(scrollContainer);
    expect(screen.getByLabelText(/Scroll Up/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Scroll Down/i)).toBeInTheDocument();

    fireEvent.mouseLeave(scrollContainer);
    expect(screen.queryByLabelText(/Scroll Up/i)).not.toBeInTheDocument();
  });

  // TC08 - Scroll buttons functionality
  test("TC08 - Scroll buttons functionality", () => {
    const scrollByMock = vi.fn();
    mockedUseMonthlySummary.mockReturnValue({
      summary: sampleSummary,
      loading: false,
      error: null,
      retry: vi.fn(),
    });

    render(<MonthlySummaryDesign />);

    const scrollContainer = screen.getByRole("table").parentElement as HTMLDivElement;
    scrollContainer.scrollBy = scrollByMock;

    fireEvent.mouseEnter(scrollContainer);

    fireEvent.click(screen.getByLabelText(/Scroll Up/i));
    expect(scrollByMock).toHaveBeenCalledWith({ top: -100, behavior: "smooth" });

    fireEvent.click(screen.getByLabelText(/Scroll Down/i));
    expect(scrollByMock).toHaveBeenCalledWith({ top: 100, behavior: "smooth" });
  });

  // TC09 - Prop summary overrides API summary
  test("TC09 - Prop summary overrides API summary", () => {
    mockedUseMonthlySummary.mockReturnValue({
      summary: [],
      loading: false,
      error: null,
      retry: vi.fn(),
    });

    const propSummary = [{ month: "March", total: 3000 }];
    render(<MonthlySummaryDesign summary={propSummary} />);

    expect(screen.getByText("March")).toBeInTheDocument();
    expect(
      screen.getByText(
        `RS ${propSummary[0].total.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      )
    ).toBeInTheDocument();
  });
});
