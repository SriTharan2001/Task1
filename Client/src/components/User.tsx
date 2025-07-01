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

  const validateForm = (data: FormDataType): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};
    if (!data.userName.trim()) errors.userName = "Username is required.";
    if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email))
      errors.email = "Valid email is required.";
    if (!data.password.trim() || data.password.length < 6)
      errors.password = "Password must be at least 6 characters.";
    if (!data.role) errors.role = "Role is required.";
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
  const errors = validateForm(editingFormData);
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
    await deleteUser(id.toString());
    await fetchUsers(); // Refresh list
    setError(null);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete user.";
    console.error("Error deleting user:", error);
    setError(errorMessage);
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            padding: "10px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <strong style={{ marginRight: "8px" }}>Error:</strong> {error}
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
            }}
            title="Dismiss"
            aria-label="Dismiss Error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "700",
          marginBottom: "24px",
          textAlign: "center",
          color: "#1f2937",
        }}
      >
        User List
      </h2>

      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          placeholder="Filter by Role"
          style={{
            padding: "8px 12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            flex: "1",
            minWidth: "200px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
          onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
        />
        <button
          onClick={() => {
            setEditingFormData({ userName: "", email: "", password: "", role: "Viewer" });
            setModalOpen(true);
          }}
          style={{
            background: "linear-gradient(to right, #3b82f6, #4f46e5)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
            transition: "all 0.3s",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "linear-gradient(to right, #2563eb, #4338ca)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "linear-gradient(to right, #3b82f6, #4f46e5)")
          }
          title="Add User"
          aria-label="Add New User"
        >
          Add User
        </button>
      </div>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={(event) => handleOutsideClick(event)}
        >
          <div
            ref={modalRef}
            style={{
              backgroundColor: "#fff",
              padding: "24px",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
              }}
              title="Close New User Modal"
              aria-label="Close New User Modal"
            >
              <X size={16} />
            </button>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#1f2937",
              }}
            >
              Add New User
            </h2>
            <form style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {["userName", "email", "password"].map((field) => (
                <div key={field} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                      textTransform: "capitalize",
                    }}
                  >
                    {field}
                  </label>
                  <input
                    type={field === "password" ? "password" : "text"}
                    name={field}
                    value={editingFormData[field as keyof FormDataType]}
                    onChange={handleInputChange}
                    placeholder={field}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  />
                  {formErrors[field] && (
                    <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                      {formErrors[field]}
                    </p>
                  )}
                </div>
              ))}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Role
                </label>
                <select
                  name="role"
                  value={editingFormData.role}
                  onChange={handleInputChange}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                  aria-label="Role"
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                </select>
                {formErrors.role && (
                  <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                    {formErrors.role}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    backgroundColor: "#d1d5db",
                    color: "#374151",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    border: "none",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#9ca3af")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#d1d5db")}
                  title="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddUser}
                  disabled={isSubmitting}
                  style={{
                    background: "linear-gradient(to right, #3b82f6, #4f46e5)",
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    border: "none",
                    transition: "all 0.3s",
                    boxShadow: isSubmitting ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
                    transform: isSubmitting ? "none" : "scale(1)",
                  }}
                  onMouseOver={(e) =>
                    !isSubmitting &&
                    (e.currentTarget.style.background = "linear-gradient(to right, #2563eb, #4338ca)")
                  }
                  onMouseOut={(e) =>
                    !isSubmitting &&
                    (e.currentTarget.style.background = "linear-gradient(to right, #3b82f6, #4f46e5)")
                  }
                  title={isSubmitting ? "Adding..." : "Add User"}
                >
                  {isSubmitting ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <thead>
          <tr
            style={{
              background: "linear-gradient(to right, #1e3a8a, #4f46e5)",
              color: "#fff",
              textTransform: "uppercase",
            }}
          >
            <th
              style={{
                padding: "16px",
                textAlign: "left",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Username
            </th>
            <th
              style={{
                padding: "16px",
                textAlign: "left",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Email
            </th>
            <th
              style={{
                padding: "16px",
                textAlign: "left",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Role
            </th>
            <th
              style={{
                padding: "16px",
                textAlign: "left",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: "14px",
                }}
              >
                No users found
              </td>
            </tr>
          ) : (
            filteredUsers.map((user) => (
              <tr
                key={user.id}
                style={{
                  transition: "background-color 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
              >
                {editingUserId === user.id ? (
                  <>
                    <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                      <input
                        type="text"
                        name="userName"
                        value={editingFormData.userName}
                        onChange={handleInputChange}
                        placeholder="UserName"
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          width: "100%",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                      />
                      {formErrors.userName && (
                        <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                          {formErrors.userName}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                      <input
                        type="email"
                        name="email"
                        value={editingFormData.email}
                        onChange={handleInputChange}
                        placeholder="email"
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          width: "100%",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                      />
                      {formErrors.email && (
                        <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                          {formErrors.email}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                      <select
                        name="role"
                        value={editingFormData.role}
                        onChange={handleInputChange}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          width: "100%",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                        onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                        aria-label="Role"
                      >
                        <option value="Viewer">Viewer</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                      </select>
                      {formErrors.role && (
                        <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                          {formErrors.role}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#3b82f6",
                          marginRight: "8px",
                          transition: "color 0.2s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = "#2563eb")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "#3b82f6")}
                        title="Save"
                      >
                        <Save size={20} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#6b7280",
                          transition: "color 0.2s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = "#4b5563")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "#6b7280")}
                        title="Cancel"
                      >
                        <X size={20} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: "16px", whiteSpace: "nowrap", color: "#374151" }}>
                      {user.userName}
                    </td>
                    <td style={{ padding: "16px", whiteSpace: "nowrap", color: "#374151" }}>
                      {user.email}
                    </td>
                    <td style={{ padding: "16px", whiteSpace: "nowrap", color: "#374151" }}>
                      {user.role}
                    </td>
                    <td style={{ padding: "16px", whiteSpace: "nowrap" }}>
                      <button
                        onClick={() => {
                          setEditingUserId(user.id);
                          setEditingFormData(user);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#3b82f6",
                          marginRight: "8px",
                          transition: "color 0.2s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = "#2563eb")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "#3b82f6")}
                        title="Edit"
                        aria-label="Edit User"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#dc2626",
                          transition: "color 0.2s",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.color = "#b91c1c")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "#dc2626")}
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
