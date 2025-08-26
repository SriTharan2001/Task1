import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach, type Mock } from "vitest";
import { MemoryRouter, useNavigate } from "react-router-dom";
import LoginForm from "../components/LogIn";
import * as useLogin from "../Hooks/useLogin";

// Mock the useNavigate hook
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock the useLogin hook
vi.mock("../Hooks/useLogin");

describe("LoginForm --- Senior Tester Scenarios", () => {
  let mockedNavigate: ReturnType<typeof vi.fn>;
  let mockedLogin: Mock;

  beforeEach(() => {
    // Set up mocks before each test
    mockedNavigate = vi.fn();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockedNavigate);

    mockedLogin = vi.spyOn(useLogin, "login").mockResolvedValue({
      token: "fake-token",
      userId: "fake-userId",
    }) as Mock;

    // Mock localStorage
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
  });

  afterEach(() => {
    // Clear all mocks after each test
    vi.clearAllMocks();
  });

  // Test Case 1: Initial Render Verification
  test("should render all form elements correctly on initial load", () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome Back 👋/i)).toBeInTheDocument();
    expect(screen.getByText(/^Select Role$/i)).toBeInTheDocument();
    expect(screen.getByText(/-- Select Role --/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i, { selector: "input" })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Enter your password/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });   

  // Test Case 2: Role Selection Functionality
  test("should open role dropdown, select a role, and update the display", () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    const roleButton = screen.getByText(/-- Select Role --/i);
    fireEvent.click(roleButton);

    // Dropdown should be visible
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Viewer")).toBeInTheDocument();
    expect(screen.getByText("Manager")).toBeInTheDocument();

    // Select a role
    fireEvent.click(screen.getByText("Manager"));

    // Display should update and dropdown should close
    expect(screen.getByText("Manager")).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  // Test Case 3: Password Visibility Toggle
  test("should toggle password visibility when the eye icon is clicked", () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    const toggleButton = screen.getByLabelText(/Show or hide password/i);

    // Initially, password should be masked
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(toggleButton).toHaveTextContent("👀");

    // First click: show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(toggleButton).toHaveTextContent("🙈");

    // Second click: hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(toggleButton).toHaveTextContent("👀");
  });

  // Test Case 4: Form Submission - Empty Fields
  test("should show 'Role is required' error if submitted without a role", async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Role is required./i)).toBeInTheDocument();
    });
  });

  // Test Case 5: Form Submission - Invalid Email
  test("should show 'Email is invalid' error for a malformed email", async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    // Select a role
    fireEvent.click(screen.getByText(/-- Select Role --/i));
    fireEvent.click(screen.getByText("Admin"));

    // Enter an invalid email
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "not-an-email" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email is invalid./i)).toBeInTheDocument();
    });
  });

  // Test Case 6: Successful Login
  test("should call login API and navigate to dashboard on successful submission", async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    // Fill the form correctly
    fireEvent.click(screen.getByText(/-- Select Role --/i));
    fireEvent.click(screen.getByText("Admin"));
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "admin@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    // Verify loading state
    expect(screen.getByText(/Logging in.../i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Logging in.../i })).toBeDisabled();

    // Verify API call and navigation
    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith(
        "admin@example.com",
        "password123",
        "Admin"
      );
      expect(localStorage.setItem).toHaveBeenCalledWith("token", "fake-token");
      expect(localStorage.setItem).toHaveBeenCalledWith("userId", "fake-userId");
      expect(mockedNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  // Test Case 7: Failed Login from API
  test("should display an error message if the login API call fails", async () => {
    // Mock a failed login response
    const errorMessage = "Invalid credentials";
    mockedLogin.mockRejectedValue(new Error(errorMessage));

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    // Fill the form
    fireEvent.click(screen.getByText(/-- Select Role --/i));
    fireEvent.click(screen.getByText("Admin"));
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter your password/i), {
      target: { value: "wrongpassword" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    // Check for the error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Ensure navigation did not happen
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  // Test Case 8: Error Message Auto-hide
  test(
    "should automatically hide the error message after 3 seconds",
    async () => {
      render(
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      );

      // Trigger an error
      fireEvent.click(screen.getByRole("button", { name: /Login/i }));
      await waitFor(() => {
        expect(screen.getByText(/Role is required./i)).toBeInTheDocument();
      });

      // Wait for the error message to disappear
      await waitFor(
        () => {
          expect(
            screen.queryByText(/Role is required./i)
          ).not.toBeInTheDocument();
        },
        { timeout: 4000 }
      );
    },
    10000
  );
});