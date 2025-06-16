// src/Routes/AppRoute.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Dashboard from '../Compont/dashboard';
import ExpenseList from '../Compont/ExpenseListDesign.tsx';
import MonthlySummary from '../Compont/MonthlySummary';
import ExpenseFormDesign from '../Compont/ExpenseForm';
import LoginForm from '../Compont/LogIn';
import MainLayout from '../Layout/MainLayout';
import User from '../Compont/User';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<LoginForm />} />

      {/* Protected Routes with layout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/User" element={ <User /> } />
        <Route path="/add-expense" element={<ExpenseFormDesign />} />
        <Route path="/expenses" element={<ExpenseList />} />
        <Route path="/monthly-summary" element={<MonthlySummary />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
