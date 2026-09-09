/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/src/pages/LandingPage";
import { Dashboard } from "@/src/pages/Dashboard";
import { EditorPage } from "@/src/pages/EditorPage";
import { BudgetTemplatePage } from "@/src/pages/BudgetTemplatePage";
import { CbydpTemplatePage } from "@/src/pages/CbydpTemplatePage";
import { AbyipTemplatePage } from "@/src/pages/AbyipTemplatePage";
import { LoginPage } from "@/src/pages/LoginPage";
import { AdminDashboard } from "@/src/pages/AdminDashboard";
import { Navbar } from "@/src/components/layout/Navbar";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider";

function AppRoutes() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="w-8 h-8 border-4 border-[#C89311] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#0C1E36] font-sans selection:bg-[#C89311]/20">
      {user && role && <Navbar />}
      <Routes>
        <Route 
          path="/" 
          element={(!user || !role) ? <LandingPage /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/login" 
          element={(!user || !role) ? <LoginPage /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={user && role ? (role === 'Admin' ? <AdminDashboard /> : <Dashboard />) : <Navigate to="/login" />} 
        />
        <Route 
          path="/editor/:type" 
          element={user && role ? <EditorPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/budget-template" 
          element={user && role ? <BudgetTemplatePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/cbydp-template" 
          element={user && role ? <CbydpTemplatePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/abyip-template" 
          element={user && role ? <AbyipTemplatePage /> : <Navigate to="/login" />} 
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

