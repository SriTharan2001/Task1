// __tests__/User.test.tsx
import React from "react";
import { vi } from "vitest";

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import User from "../components/User";
import useUserRegisterForm from "../Hooks/useUserRegisterForm";

// Mock the custom hook
vi.mock("../Hooks/useUserRegisterForm");
const mockUseUserRegisterForm = useUserRegisterForm as jest.MockedFunction<
  typeof useUserRegisterForm
>; // <-- We'll fix the jest.MockedFunction part too

describe("User Management Component", () => {
  const mockFetchUsers = vi.fn();
  const mockAddUser = vi.fn();
  const mockUpdateUser = vi.fn();
  const mockDeleteUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserRegisterForm.mockReturnValue({
      fetchUsers: mockFetchUsers,
      addUser: mockAddUser,
      updateUser: mockUpdateUser,
      deleteUser: mockDeleteUser,
    } as unknown as ReturnType<typeof useUserRegisterForm>);
  });


  test("TC-001: Fetch and display existing users", async () => {
    mockFetchUsers.mockResolvedValue([
      { id: 1, userName: "John", email: "john@example.com", role: "Admin" },
    ]);

    render(<User />);

    expect(mockFetchUsers).toHaveBeenCalled();
    expect(await screen.findByText("John")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  test("TC-002: Add a new user – valid data", async () => {
    mockFetchUsers.mockResolvedValue([]);
    mockAddUser.mockResolvedValue({
      id: 1,
      userName: "John Doe",
      email: "john@example.com",
      role: "Admin",
    });

    render(<User />);

    fireEvent.click(screen.getByText(/Add User/i));
    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByTitle(/Role/i), {
      target: { value: "Admin" },
    });

    fireEvent.click(screen.getByText(/^Add$/));

    await waitFor(() =>
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    );
  });

  test("TC-003: Add user – missing username", async () => {
    mockFetchUsers.mockResolvedValue([]);

    render(<User />);
    fireEvent.click(screen.getByText(/Add User/i));

    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: "123456" },
    });

    fireEvent.click(screen.getByText(/^Add$/));

    expect(await screen.findByText(/Username is required/i)).toBeInTheDocument();
    expect(mockAddUser).not.toHaveBeenCalled();
  });

  test("TC-006: Edit user – change role", async () => {
    mockFetchUsers.mockResolvedValue([
      { id: 1, userName: "John", email: "john@example.com", role: "Viewer" },
    ]);
    mockUpdateUser.mockResolvedValue({
      id: 1,
      userName: "John",
      email: "john@example.com",
      role: "Manager",
    });

    render(<User />);

    fireEvent.click(await screen.findByTitle(/Edit/i));
    fireEvent.change(screen.getByTitle(/Role/i), {
      target: { value: "Manager" },
    });
    fireEvent.click(screen.getByTitle(/Save/i));

    await waitFor(() =>
      expect(screen.getByText("Manager")).toBeInTheDocument()
    );
  });

  test("TC-009: Delete user", async () => {
    mockFetchUsers.mockResolvedValue([
      { id: 1, userName: "John", email: "john@example.com", role: "Admin" },
    ]);
    mockDeleteUser.mockResolvedValue({});

    render(<User />);
    fireEvent.click(await screen.findByTitle(/Delete/i));

    await waitFor(() =>
      expect(screen.queryByText("John")).not.toBeInTheDocument()
    );
  });

  test("TC-010: Filter users by role", async () => {
    mockFetchUsers.mockResolvedValue([
      { id: 1, userName: "John", email: "john@example.com", role: "Admin" },
      { id: 2, userName: "Jane", email: "jane@example.com", role: "Viewer" },
    ]);

    render(<User />);

    fireEvent.change(await screen.findByPlaceholderText(/Filter by role/i), {
      target: { value: "Admin" },
    });

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.queryByText("Viewer")).not.toBeInTheDocument();
  });
});
