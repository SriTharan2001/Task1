import { useState } from "react";

export interface FormDataType {
  userName: string;
  email: string;
  password: string;
  role: string;
}

const useUserRegisterForm = () => {
  const [formData, setFormData] = useState<FormDataType>({
    userName: "",
    email: "",
    password: "",
    role: "Viewer",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage(data.message || "User registered successfully!");
        setFormData({
          userName: "",
          email: "",
          password: "",
          role: "Viewer",
        });

        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("API Error:", err);
      alert("Server not reachable. Please ensure backend is running.");
    }
  };

  return { formData, handleChange, handleSubmit, successMessage };
};

export default useUserRegisterForm;
