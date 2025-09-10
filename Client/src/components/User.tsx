import React, { useState, useEffect, useContext, useRef } from "react";
import { Edit, Trash2, Save, X } from "lucide-react";
import useUserRegisterForm from "../Hooks/useUserRegisterForm";
import type { UserWithId, FormDataType } from "../Hooks/useUserRegisterForm";
import { ThemeContext } from "../context/ThemeContext";

// Compact and accessible field
const FormField = ({
  label,
  type = "text",
  name,
  value,
  error,
  options,
  onChange,
}: {
  label: string;
  type?: string;
  name: keyof FormDataType;
  value: string;
  error?: string;
  options?: string[];
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
}) => {
  const id = `form-field-${name}`;
  return (
    <div className="flex flex-col gap-1 text-[10px] sm:text-xs">
      <label htmlFor={id} className="font-medium text-gray-700">
        {label}
      </label>
      {type === "select" ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className="px-2 py-[6px] border rounded-md focus:outline-none focus:border-blue-500 text-[10px] sm:text-xs"
          title={label}
        >
          {options?.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={label}
          className="px-2 py-[6px] border rounded-md focus:outline-none focus:border-blue-500 text-[10px] sm:text-xs"
        />
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

const Modal = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return isOpen ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-2"
      onClick={(e) => {
        if (!ref.current?.contains(e.target as Node)) onClose();
      }}
    >
      <div
        ref={ref}
        className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-sm shadow-md relative"
      >
        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={16} />
        </button>
        {children}
      </div>
    </div>
  ) : null;
};

const ROLES = ["Viewer", "Admin", "Manager"];
const EMPTY: FormDataType = { userName: "", email: "", password: "", role: "Viewer" };

const User = () => {
  const { fetchUsers, updateUser, deleteUser, addUser } = useUserRegisterForm();
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormDataType>(EMPTY);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  const validate = (data: FormDataType, isEdit = false) => {
    const errors: { [key: string]: string } = {};
    if (!data.userName.trim()) errors.userName = "Username is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Valid email required.";
    if (!isEdit && data.password.length < 6) errors.password = "Min 6 characters.";
    if (!data.role) errors.role = "Role is required.";
    return errors;
  };

  const { theme } = useContext(ThemeContext);


  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleAdd = async () => {
    const errors = validate(formData);
    if (Object.keys(errors).length) return setFormErrors(errors);
    try {
      setSubmitting(true);
      const newUser = await addUser(formData);
      setUsers((prev) => [...prev, newUser]);
      setFormData(EMPTY);
      setModalOpen(false);
    } catch {
      setError("Add failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    const errors = validate(formData, true);
    if (Object.keys(errors).length || editingId === null) return setFormErrors(errors);
    try {
      setSubmitting(true);
      const updated = await updateUser(formData, editingId);
      setUsers((prev) => prev.map((u) => (u.id === editingId ? updated : u)));
      setEditingId(null);
      setFormData(EMPTY);
    } catch {
      setError("Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(String(id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError("Delete failed.");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch {
        setError("Fetch failed.");
      }
    })();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) =>
    filter ? u.role.toLowerCase().includes(filter.toLowerCase()) : true
  );

  return (
    <div className="max-w-6xl mx-auto px-3 py-4 font-sans bg-gray-50 min-h-screen">
      {error && (
        <div className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button 
          type="button"
          aria-label="Close error"

          onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <h1 className="text-xl sm:text-2xl font-bold mb-5 text-center text-gray-800">
        User Management
      </h1>

      {/* Filter + Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 w-full">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by role"
          className="px-3 py-2 border border-gray-300 rounded-md w-full sm:w-1/2 text-[10px] sm:text-sm"
        />
        <button
          onClick={() => {
            setFormData(EMPTY);
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-[10px] sm:text-sm hover:bg-blue-700 w-full sm:w-auto"
        >
          Add User
        </button>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-sm sm:text-base font-semibold mb-4">Add New User</h2>
        <form className="flex flex-col gap-3">
          <FormField label="Username" name="userName" value={formData.userName} onChange={onChange} error={formErrors.userName} />
          <FormField label="Email" name="email" value={formData.email} onChange={onChange} error={formErrors.email} />
          <FormField label="Password" name="password" type="password" value={formData.password} onChange={onChange} error={formErrors.password} />
          <FormField label="Role" name="role" type="select" value={formData.role} onChange={onChange} error={formErrors.role} options={ROLES} />
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="bg-gray-300 px-3 py-1 rounded-md text-sm">
              Cancel
            </button>
            <button type="button" onClick={handleAdd} disabled={isSubmitting} className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">
              {isSubmitting ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-md shadow">
        <table className="min-w-full text-[10px] sm:text-sm">
          <thead  className={` text-white ${theme === "dark" ? "bg-blue-600" : "bg-gray-950"}`} >
            <tr>
              <th className="px-3 py-2 text-left font-medium">Username</th>
              <th className="px-3 py-2 text-left font-medium">Email</th>
              <th className="px-3 py-2 text-left font-medium">Role</th>
              <th className="px-3 py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-500 py-4">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  {editingId === u.id ? (
                    <>
                      <td className="px-2 py-1">
                        <input
                          name="userName"
                          value={formData.userName}
                          onChange={onChange}
                          className="w-full border rounded px-2 py-1 text-[10px] sm:text-sm"
                          placeholder="Username"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          name="email"
                          value={formData.email}
                          onChange={onChange}
                          className="w-full border rounded px-2 py-1 text-[10px] sm:text-sm"
                          placeholder="Email"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <select
                          name="role"
                          value={formData.role}
                          onChange={onChange}
                          className="w-full border rounded px-2 py-1 text-[10px] sm:text-sm"
                          title="Role"
                        >
                          {ROLES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-1 flex gap-2">
                        <button onClick={handleSave} className="text-green-600" title="Save">
                          <Save size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-red-600" title="Cancel">
                          <X size={16} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-2 py-1">{u.userName}</td>
                      <td className="px-2 py-1">{u.email}</td>
                      <td className="px-2 py-1">{u.role}</td>
                      <td className="px-2 py-1 flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(u.id);
                            setFormData({ ...u, password: "" });
                          }}
                          className="text-blue-600"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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
    </div>
  );
};

export default User;
