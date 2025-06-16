import React from "react";
import "../Css/User.css";
import useUserRegisterForm from "../Service/UserApi";

const User: React.FC = () => {
  const { formData, handleChange, handleSubmit, successMessage } =
    useUserRegisterForm();

  return (
    <div className="user-container">
      <form onSubmit={handleSubmit} className="user-form">
        <h2>User Registration</h2>
        {successMessage && (
          <div className="success-message">✅ {successMessage}</div>
        )}

        <div className="form-group floating-label">
          <input type="text" name="userName" value={formData.userName}
            onChange={handleChange} required placeholder=" " title="User Name" />
          <label>User Name</label>
        </div>

        <div className="form-group floating-label">
          <input type="email" name="email" value={formData.email}
            onChange={handleChange} required placeholder="" title="Email" />
          <label>Email</label>
        </div>

        <div className="form-group floating-label">
          <input type="password" name="password" value={formData.password}
            onChange={handleChange} required placeholder="" title="Password" />
          <label>Password</label>
        </div>

        <div className="form-group floating-label">
          <select name="role" value={formData.role} onChange={handleChange}
            required aria-label="Select Role" title="Select Role">
            <option value="" disabled hidden />
            <option value="Viewer">Viewer</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
          </select>
          <label>Select Role</label>
        </div>

        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default User;
