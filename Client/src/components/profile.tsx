import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../utils/api"; // ✅ Using this instance instead of axios

interface User {
  userName?: string;
  email?: string;
  picture?: string;
}

interface ProfileProps {
  user?: User | null;
  onClose?: () => void;
}
interface ProfileProps {
  user?: User | null;
  onClose?: () => void;
  onLogout?: () => void; // ✅ Add this line
}


interface ProfileImageUploadResponse {
  user: {
    picture: string;
  };
}

const LOCAL_STORAGE_KEY = "profileImage";

// ✅ Exported logout function
export const logout = async () => {
  try {
    await api.post("/api/auth/logout");
  } catch (err) {
    
    // ignore or log error, e.g. console.warn("Logout API failed", err);
  }
  localStorage.removeItem("token");
    localStorage.clear();        // Clear token and session info

  window.location.href = "/login";
};

const Profile: React.FC<ProfileProps> = ({ user, onClose }) => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string>("");

  useEffect(() => {
    const savedImage = user?.picture || localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedImage) {
      setProfileImage(
        `http://localhost:5000/uploads/${encodeURIComponent(savedImage)}`
      );
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.put<ProfileImageUploadResponse>(
        "/api/auth/profile/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedImage = response.data?.user?.picture;
      if (updatedImage) {
        const newImageUrl = `http://localhost:5000/uploads/${encodeURIComponent(
          updatedImage
        )}`;
        setProfileImage(newImageUrl);
        localStorage.setItem(LOCAL_STORAGE_KEY, updatedImage);
      }
    } catch (error) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      const msg =
        err.response?.data?.message || err.message || "Image upload failed.";
      alert(msg);
    }
  };

  if (!user) return null;

  return (
    <div
      style={{ backgroundColor: "#14213D" }}
      className="rounded-xl shadow-xl w-80 p-6 relative text-center text-white"
    >
      {onClose && (
        <button
          className="absolute top-2 right-2 text-gray-100 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>
      )}

      <p className="text-gray-200 text-sm mb-4 font-medium">{user.email}</p>

      <div className="relative w-20 h-20 mx-auto mb-3">
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="rounded-full border border-white w-full h-full object-cover bg-gray-300"
          />
        ) : (
          <div className="rounded-full bg-gray-500 w-full h-full flex items-center justify-center text-2xl font-bold text-white">
            {user.userName?.charAt(0).toUpperCase() || "U"}
          </div>
        )}

        <label
          htmlFor="profile-image-upload"
          className="absolute bottom-0 right-0 cursor-pointer"
        >
          <FaEdit className="bg-white rounded-full p-1 text-gray-600 w-6 h-6" />
        </label>
        <input
          id="profile-image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          title="Upload profile image"
          placeholder="Choose a profile image"
        />
      </div>

      <h2 className="text-xl font-semibold mb-2">
        {user.userName || "User"}
      </h2>

      <div className="flex space-x-2 mt-4">
        <button
          className="flex-1  bg-white text-black border-red-400 rounded-md py-2 text-sm hover:bg-red-50 transition-all"
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Profile;