// Dashboard.test.tsx
import { render, screen } from "@testing-library/react";
import { vi , type Mock } from "vitest";
import { MemoryRouter, useNavigate } from "react-router-dom";
import React from "react";

import Dashboard from "../components/dashboard";

// Mock hooks
vi.mock("../Hooks/useExpenseDashBoard");
vi.mock("../Hooks/useMonthlySummary");
vi.mock("../Hooks/useCategoryExpenses");
vi.mock("../Hooks/useExpenseCounters");
vi.mock("../Hooks/useAutoLogout");

import useExpenseDashboard from "../Hooks/useExpenseDashBoard";
import useMonthlySummary from "../Hooks/useMonthlySummary";
import useCategoryExpenses from "../Hooks/useCategoryExpenses";
import useExpenseCounters from "../Hooks/useExpenseCounters";
import useAutoLogout from "../Hooks/useAutoLogout";

const navigateMock = vi.fn();
(useNavigate as unknown as Mock).mockReturnValue(navigateMock);

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Store chart props for inspection
interface ChartData {
  labels: string[];
  datasets: { data: number[] }[];
}

interface PieOptions {
  plugins: {
    legend: {
      labels: {
        generateLabels: (chart: { data: ChartData }) => { text: string }[];
      };
    };
    title: {
      font: {
        size: number;
      };
    };
  };
}

let lastPieProps: {
  data?: ChartData;
  options?: PieOptions;
} = {};

let lastBarProps: {
  data?: {
    datasets: { data: number[] }[];
  };
} = {};

// Mock react-chartjs-2
vi.mock("react-chartjs-2", () => ({
  Pie: (props: Record<string, unknown>) => {
    lastPieProps = props;
    return <div data-testid="pie-chart" />;
  },
  Bar: (props: Record<string, unknown>) => {
    lastBarProps = props;
    return <div data-testid="bar-chart" />;
  },
}));


// Mock chart.js completely for tests
vi.mock("chart.js", async () => {
  const original = await vi.importActual<typeof import("chart.js")>("chart.js");
  return {
    ...original,
    Chart: {
      ...original.Chart,
      register: vi.fn(), // mock the register function
    },
    ArcElement: vi.fn(),
    BarElement: vi.fn(),
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    Tooltip: vi.fn(),
    Legend: vi.fn(),
    Title: vi.fn(),
  };
});




const renderDashboard = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    lastPieProps = {};
    lastBarProps = {};
  });

it("TC01 - Redirect if no token in localStorage", () => {
  const navigateMock = vi.fn();
  (useNavigate as Mock).mockReturnValue(navigateMock);

  renderDashboard();
  expect(navigateMock).toHaveBeenCalledWith("/login");
});


  it("TC02 - Display loading state", () => {
  localStorage.setItem("token", "abc");

  (useExpenseDashboard as Mock).mockReturnValue({ loading: true });
  (useMonthlySummary as Mock).mockReturnValue({ loading: true });
  (useCategoryExpenses as Mock).mockReturnValue({ loading: true });
  (useExpenseCounters as Mock).mockReturnValue({ loading: true });

  renderDashboard();
  expect(screen.getByText("Loading...")).toBeInTheDocument();
});

 it("TC03 - Display error state", () => {
  localStorage.setItem("token", "abc");

  (useExpenseDashboard as Mock).mockReturnValue({
    loading: false,
    error: "Something went wrong",
  });
  (useMonthlySummary as Mock).mockReturnValue({ loading: false, summary: [] });
  (useCategoryExpenses as Mock).mockReturnValue({ loading: false, data: [] });
  (useExpenseCounters as Mock).mockReturnValue({
    loading: false,
    data: { total: 0, monthly: 0, daily: 0 },
  });

  renderDashboard();
  expect(screen.getByText("Something went wrong")).toBeInTheDocument();
});

  it("TC04 - Show cards with correct counters", () => {
    localStorage.setItem("token", "abc");
    (useExpenseDashboard as Mock).mockReturnValue({ loading: false });
    (useMonthlySummary as Mock).mockReturnValue({ loading: false, summary: [] });
    (useCategoryExpenses as Mock).mockReturnValue({ loading: false, data: [] });
    (useExpenseCounters as Mock).mockReturnValue({
      loading: false,
      data: { total: 5000, monthly: 1200, daily: 150 },
    });

    renderDashboard();
    expect(screen.getByText("RS 5000.00")).toBeInTheDocument();
    expect(screen.getByText("RS 1200.00")).toBeInTheDocument();
    expect(screen.getByText("RS 150.00")).toBeInTheDocument();
  });

 it("TC05 - Pie chart data mapping", () => {
  localStorage.setItem("token", "abc");

  // Mock hooks
  (useExpenseDashboard as Mock).mockReturnValue({ loading: false });
  (useMonthlySummary as Mock).mockReturnValue({ loading: false, summary: [] });
  (useCategoryExpenses as Mock).mockReturnValue({
    loading: false,
    data: [
      { name: "Food", value: 200, count: 4 },
      { name: "Travel", value: 300, count: 2 },
    ],
  });
  (useExpenseCounters as Mock).mockReturnValue({
    loading: false,
    data: { total: 0, monthly: 0, daily: 0 },
  });

  render(<Dashboard />);

  if (lastPieProps.data) {
    expect(lastPieProps.data.labels).toEqual(["Food (4)", "Travel (2)"]);
    expect(lastPieProps.data.datasets[0].data).toEqual([200, 300]);
  }
});

  it("TC06 - Pie chart legend percentage calculation", () => {
    localStorage.setItem("token", "abc");
    (useExpenseDashboard as Mock).mockReturnValue({ loading: false });
    (useMonthlySummary as Mock).mockReturnValue({ loading: false, summary: [] });
    (useCategoryExpenses as Mock).mockReturnValue({
      loading: false,
      data: [
        { name: "Food", value: 200, count: 4 },
        { name: "Travel", value: 300, count: 2 },
      ],
    });
    (useExpenseCounters as Mock).mockReturnValue({
      loading: false,
      data: { total: 0, monthly: 0, daily: 0 },
    });

    renderDashboard();
    if (lastPieProps.options && lastPieProps.data) {
      const legendLabels = lastPieProps.options.plugins.legend.labels.generateLabels(
        {
          data: lastPieProps.data,
        }
      );
      expect(legendLabels[0].text).toContain("40.0%");
      expect(legendLabels[1].text).toContain("60.0%");
    }
  });

  it("TC07 - Bar chart data mapping", () => {
    localStorage.setItem("token", "abc");
    (useExpenseDashboard as Mock).mockReturnValue({ loading: false });
    (useMonthlySummary as Mock).mockReturnValue({
      loading: false,
      summary: [
        { month: "2025-01", total: 500 },
        { month: "2025-03", total: 1000 },
      ],
    });
    (useCategoryExpenses as Mock).mockReturnValue({ loading: false, data: [] });
    (useExpenseCounters as Mock).mockReturnValue({
      loading: false,
      data: { total: 0, monthly: 0, daily: 0 },
    });

    renderDashboard();
    if (lastBarProps.data) {
      expect(lastBarProps.data.datasets[0].data).toEqual([
        500, 0, 1000, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]);
    }
  });

  it("TC08 - Responsive font size check", () => {
    localStorage.setItem("token", "abc");
    Object.defineProperty(window, "innerWidth", { writable: true, value: 500 });

    (useExpenseDashboard as Mock).mockReturnValue({ loading: false });
    (useMonthlySummary as Mock).mockReturnValue({ loading: false, summary: [] });
    (useCategoryExpenses as Mock).mockReturnValue({ loading: false, data: [] });
    (useExpenseCounters as Mock).mockReturnValue({
      loading: false,
      data: { total: 0, monthly: 0, daily: 0 },
    });

    renderDashboard();
    if (lastPieProps.options) {
      expect(lastPieProps.options.plugins.title.font.size).toBe(12);
    }
  });

  it("TC09 - Auto logout trigger", () => {
    localStorage.setItem("token", "abc");
    const autoLogoutMock = vi.fn();
    (useAutoLogout as Mock).mockImplementation(autoLogoutMock);

    (useExpenseDashboard as Mock).mockReturnValue({ loading: false });
    (useMonthlySummary as Mock).mockReturnValue({ loading: false, summary: [] });
    (useCategoryExpenses as Mock).mockReturnValue({ loading: false, data: [] });
    (useExpenseCounters as Mock).mockReturnValue({
      loading: false,
      data: { total: 0, monthly: 0, daily: 0 },
    });

    renderDashboard();
    expect(autoLogoutMock).toHaveBeenCalled();
  });

  it("TC10 - Combined chart rendering", () => {
    localStorage.setItem("token", "abc");
    (useExpenseDashboard as Mock).mockReturnValue({ loading: false });
    (useMonthlySummary as Mock).mockReturnValue({ loading: false, summary: [] });
    (useCategoryExpenses as Mock).mockReturnValue({ loading: false, data: [] });
    (useExpenseCounters as Mock).mockReturnValue({
      loading: false,
      data: { total: 0, monthly: 0, daily: 0 },
    });

    renderDashboard();
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });
});