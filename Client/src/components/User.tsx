import React, { useState, useEffect, useRef } from "react";
import { Edit, Trash2, Save, X } from "lucide-react";
import useUserRegisterForm from "../Hooks/useUserRegisterForm";
import type { UserWithId, FormDataType } from "../Hooks/useUserRegisterForm";

const User: React.FC = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { fetchUsers, updateUser, deleteUser, addUser } = useUserRegisterForm();
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingFormData, setEditingFormData] = useState<FormDataType>({
    userName: "",
    email: "",
    password: "",
    role: "Viewer",
  });
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

const validateForm = (data: FormDataType, isEditMode: boolean = false): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!data.userName?.trim()) {
    errors.userName = "Username is required.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email?.trim() || !emailRegex.test(data.email)) {
    errors.email = "Valid email is required.";
  }

  if (!isEditMode && (!data.password?.trim() || data.password.length < 6)) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!data.role?.trim()) {
    errors.role = "Role is required.";
  }

  return errors;
};

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setEditingFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddUser = async () => {
    const errors = validateForm(editingFormData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSubmitting(true);
    try {
      const newUser: UserWithId = await addUser(editingFormData);
      setUsers((prev) => [...prev, newUser]);
      setModalOpen(false);
      setEditingFormData({ userName: "", email: "", password: "", role: "Viewer" });
      setFormErrors({});
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add user.";
      console.error("Error adding user:", error);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    const errors = validateForm(editingFormData, true);
    if (Object.keys(errors).length > 0 || !editingUserId) {
      setFormErrors(errors);
      return;
    }
    setSubmitting(true);
    try {
      if (editingUserId !== null) {
        const updatedUser = await updateUser(editingFormData, editingUserId);
        setUsers((prev) =>
          prev.map((user) =>
            user.id === editingUserId ? updatedUser : user
          )
        );
        setEditingUserId(null);
        setEditingFormData({ userName: "", email: "", password: "", role: "Viewer" });
        setFormErrors({});
        setError(null);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update user.";
      console.error("Error updating user:", error);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditingFormData({ userName: "", email: "", password: "", role: "Viewer" });
    setFormErrors({});
    setError(null);
  };

  const handleDelete = async (id: number) => {
    try {
      // Optimistically update the UI
      setUsers((prev) => prev.filter((user) => user.id !== id));
      await deleteUser(id.toString());
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user.";
      console.error("Error deleting user:", error);
      setError(errorMessage);
      // Refetch users to restore state if deletion fails
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    }
  };

  const handleOutsideClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setModalOpen(false);
      setFormErrors({});
      setError(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        setModalOpen(false);
        setFormErrors({});
        setError(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const fetchedUsers: UserWithId[] = await fetchUsers();
        setUsers(fetchedUsers);
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch users.";
        console.error("Error fetching users:", error);
        setError(errorMessage);
      }
    };
    fetchUserData();
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) =>
    categoryFilter ? user.role.toLowerCase().includes(categoryFilter.toLowerCase()) : true
  );

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      {error && (
        <div className="flex items-center bg-red-100 text-red-600 px-4 py-2 rounded-lg mb-5 text-sm font-medium shadow">
          <strong className="mr-2">Error:</strong> {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto bg-transparent border-none text-red-600 hover:text-red-700 focus:outline-none flex items-center"
            title="Dismiss"
            aria-label="Dismiss Error"
          >
            <X size={16} />
          </button>
        </div>

      )}

      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        User List
      </h2>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          placeholder="Filter by Role"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-[200px] outline-none focus:border-blue-500 transition-colors"
        />
        <button
          onClick={() => {
            setEditingFormData({ userName: "", email: "", password: "", role: "Viewer" });
            setModalOpen(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border-none transition-all shadow-sm hover:from-blue-600 hover:to-indigo-700"
          title="Add User"
          aria-label="Add New User"
        >
          Add User
        </button>
      </div>

    {isModalOpen && (
  <div className=" inset-0 z-50 flex items-center justify-center  backdrop-blur-sm mt-40">
    <div
      className="absolute inset-0  bg-opacity- backdrop-blur-sm flex items-center justify-center rounded-xl"
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing when clicking inside modal
      >
        <button
          onClick={() => setModalOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          title="Close New User Modal"
          aria-label="Close New User Modal"
        >
          <X size={16} />
        </button>

        <h2 className="text-xl font-semibold mb-5 text-gray-800">
          Add New User
        </h2>

        <form className="flex flex-col gap-4 ">
          {["userName", "email", "password"].map((field) => (
            <div key={field} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 capitalize">
                {field}
              </label>
              <input
                type={field === "password" ? "password" : "text"}
                name={field}
                value={editingFormData[field as keyof FormDataType] || ""}
                onChange={handleInputChange}
                placeholder={field}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500"
              />
              {formErrors[field] && (
                <p className="text-red-600 text-xs mt-1">
                  {formErrors[field]}
                </p>
              )}
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={editingFormData.role || "Viewer"}
              onChange={handleInputChange}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none transition-colors focus:border-blue-500"
              aria-label="Role"
            >
              <option value="Viewer">Viewer</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
            </select>
            {formErrors.role && (
              <p className="text-red-600 text-xs mt-1">{formErrors.role}</p>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-gray-400"
              title="Cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddUser}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-sm ${
                isSubmitting
                  ? "bg-gradient-to-r from-blue-400 to-indigo-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              }`}
              title={isSubmitting ? "Adding..." : "Add User"}
            >
              {isSubmitting ? "Adding..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}


      <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden bg-white">
        <thead>
          <tr className="bg-gradient-to-r from-blue-900 to-indigo-700 text-white uppercase">
            <th className="px-4 py-4 text-left text-sm font-semibold">Username</th>
            <th className="px-4 py-4 text-left text-sm font-semibold">Email</th>
            <th className="px-4 py-4 text-left text-sm font-semibold">Role</th>
            <th className="px-4 py-4 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr key="no-users">
              <td
                colSpan={4}
                className="px-4 py-4 text-center text-sm text-gray-500"
              >
                No users found
              </td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-gray-100 transition-colors"
              >
                {editingUserId === user.id ? (
                  <>
                    {(["userName", "email", "password"] as (keyof FormDataType)[]).map((field) => (
                      <td key={field} className="px-4 py-4 whitespace-nowrap">
                        <input
                          type={field === "password" ? "password" : "text"}
                          name={field}
                          value={editingFormData[field] || ""}
                          onChange={handleInputChange}
                          placeholder={field === "password" ? "Password (optional)" : field}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                        />
                        {formErrors[field] && (
                          <p className="text-red-600 text-xs mt-1">{formErrors[field]}</p>
                        )}
                      </td>
                    ))}

                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        name="role"
                        value={editingFormData.role || "Viewer"}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                        aria-label="Role"
                      >
                        <option value="Viewer">Viewer</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                      </select>
                      {formErrors.role && (
                        <p className="text-red-600 text-xs mt-1">{formErrors.role}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={handleSaveEdit}
                        className="text-blue-500 hover:text-blue-700 mr-2 transition-colors"
                        title="Save"
                      >
                        <Save size={20} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title="Cancel"
                      >
                        <X size={20} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">{user.userName}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">{user.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-700">{user.role}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingUserId(user.id);
                          setEditingFormData({ ...user, password: "" });
                        }}
                        className="text-blue-500 hover:text-blue-700 mr-2 transition-colors"
                        title="Edit"
                        aria-label="Edit User"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete"
                        aria-label="Delete User"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

    </div>
  );
};

export default User;