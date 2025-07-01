// src/Routes/AppRoute.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Dashboard from '../components/dashboard';
import ExpenseList from '../components/ExpenseListDesign.tsx';
import MonthlySummary from '../components/MonthlySummary';
import ExpenseFormDesign from '../components/ExpenseForm';
import LoginForm from '../components/LogIn';
import MainLayout from '../Layout/MainLayout';
import User from '../components/User';
import { Navigate } from 'react-router-dom';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/login" element={<LoginForm />} />

      {/* Protected Routes with layout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-expense" element={<ExpenseFormDesign />} />
        <Route path="/expenses" element={<ExpenseList />} />
        <Route path="/monthly-summary" element={<MonthlySummary />} />
        <Route path="/User" element={<User />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
