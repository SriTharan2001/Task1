// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoreValue } from "pulsy";
import { getAllowedRoutes } from "../utils/getAllowedRoutes";
import type { AuthStore } from "../Types/AuthStore";

interface Props {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const authStore = getStoreValue<AuthStore>("auth");
  const user = authStore?.user; // Optional chaining to safely access user
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoutes = getAllowedRoutes(user.role);
  if (!allowedRoutes.includes(location.pathname)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;