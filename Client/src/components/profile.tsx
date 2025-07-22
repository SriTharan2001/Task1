import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface User {
  userName?: string;
  email?: string;
  picture?: string;
}

interface ProfileProps {
  user?: User | null;
  onClose?: () => void;
  onLogout: () => void;
}

interface ProfileImageUploadResponse {
  user: {
    picture: string;
  };
}

const LOCAL_STORAGE_KEY = "profileImage";

const Profile: React.FC<ProfileProps> = ({ user, onClose, onLogout }) => {
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
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in first");

      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.put<ProfileImageUploadResponse>(
        "http://localhost:5000/api/auth/profile/image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    onLogout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-600 rounded-xl shadow-xl w-80 p-6 relative text-center text-white">
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
        Hi, {user.userName || "User"}!
      </h2>
      <p className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md mb-4 cursor-pointer transition-all">
        Manage your Account
      </p>
      <div className="flex space-x-2 mt-2">
        <button
          className="flex-1 bg-white text-red-600 border border-red-400 rounded-md py-2 text-sm hover:bg-red-50 transition-all"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Profile;
