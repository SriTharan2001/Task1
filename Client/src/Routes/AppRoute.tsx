import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/dashboard';
import ExpenseList from '../components/ExpenseListDesign';
import MonthlySummary from '../components/MonthlySummary';
import ExpenseFormDesign from '../components/ExpenseForm';
import LoginForm from '../components/LogIn';
import MainLayout from '../Layout/MainLayout';
import User from '../components/User';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<LoginForm />} />

    <Route element={<MainLayout />}>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-expense"
        element={
          <ProtectedRoute>
            <ExpenseFormDesign />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <ExpenseList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/monthly-summary"
        element={
          <ProtectedRoute>
            <MonthlySummary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <User />
          </ProtectedRoute>
        }
      />
     
    </Route>
  </Routes>
);

export default AppRoutes;