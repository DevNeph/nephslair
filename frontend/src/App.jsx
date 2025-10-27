import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import AdminRoute from './components/common/AdminRoute';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import ManageProjects from './pages/Admin/Projects/ManageProjects';
import CreateProject from './pages/Admin/Projects/CreateProject';
import EditProject from './pages/Admin/Projects/EditProject';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-black flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/projects"
                element={
                  <AdminRoute>
                    <ManageProjects />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/projects/create"
                element={
                  <AdminRoute>
                    <CreateProject />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/projects/edit/:id"
                element={
                  <AdminRoute>
                    <EditProject />
                  </AdminRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;