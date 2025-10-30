import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SeoHead from './components/common/SeoHead';
import ErrorBoundary from './components/common/ErrorBoundary';
import { refreshSettingsCache } from './services/api';
import HomePage from './pages/Home/HomePage';
import ProjectPage from './pages/Project/ProjectPage';
import ProjectAboutPage from './pages/Project/ProjectAboutPage';
import ProjectDownloadsPage from './pages/Project/ProjectDownloadsPage';
import ProjectChangelogsPage from './pages/Project/ProjectChangelogsPage';
import PostPage from './pages/Post/PostPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import AdminRoute from './components/common/AdminRoute';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard';
import ManageProjects from './pages/Admin/Projects/ManageProjects';
import CreateProject from './pages/Admin/Projects/CreateProject';
import EditProject from './pages/Admin/Projects/EditProject';
import ManagePosts from './pages/Admin/Posts/ManagePosts';
import PostForm from './pages/Admin/Posts/PostForm';
import ManageUsers from './pages/Admin/Users/ManageUsers';
import ManageComments from './pages/Admin/Comments/ManageComments';
import ManageReleases from './pages/Admin/Releases/ManageReleases';
import ReleaseForm from './pages/Admin/Releases/ReleaseForm';
import ManagePolls from './pages/Admin/Polls/ManagePolls';
import CreatePoll from './pages/Admin/Polls/CreatePoll';
import EditPoll from './pages/Admin/Polls/EditPoll'; // ← EKLE
import PollDetails from './pages/Admin/Polls/PollDetails';
import WebsiteSettings from './pages/Admin/Settings/WebsiteSettings';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import Maintenance from './components/common/Maintenance';

function MaintenanceGate({ children }) {
  const location = useLocation();
  const raw = localStorage.getItem('website_settings');
  const settings = raw ? JSON.parse(raw) : {};
  const maint = String(settings.maintenance_mode || 'false') === 'true';
  const rawUser = localStorage.getItem('nephslair_user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  const isAdmin = user?.role === 'admin';
  const path = location.pathname.toLowerCase();
  const isLoginPath = path.startsWith('/login');
  const isAdminPath = path.startsWith('/admin');

  if (maint && !isAdmin && !isLoginPath && !isAdminPath) {
    return <Maintenance />;
  }
  return children;
}

function App() {
  useEffect(() => { refreshSettingsCache(); }, []);
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <MaintenanceGate>
            <div className="min-h-screen bg-black flex flex-col">
              <Navbar />
              <SeoHead />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#262626',
                  color: '#fff',
                },
              }}
            />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                
                {/* Project Routes */}
                <Route path="/project/:slug" element={<ProjectPage />} />
                <Route path="/project/:slug/about" element={<ProjectAboutPage />} />
                <Route path="/project/:slug/downloads" element={<ProjectDownloadsPage />} />
                <Route path="/project/:slug/changelogs" element={<ProjectChangelogsPage />} />
                
                {/* Post Routes */}
                <Route path="/project/:slug/post/:postSlug" element={<PostPage />} />
                <Route path="/post/:postSlug" element={<PostPage />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                
                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                
                {/* User Management */}
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <ManageUsers />
                    </AdminRoute>
                  }
                />
                
                {/* Project Management */}
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
                
                {/* Post Management */}
                <Route
                  path="/admin/posts"
                  element={
                    <AdminRoute>
                      <ManagePosts />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/posts/create"
                  element={
                    <AdminRoute>
                      <PostForm />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/posts/edit/:id"
                  element={
                    <AdminRoute>
                      <PostForm />
                    </AdminRoute>
                  }
                />

                {/* Comment Management */}
                <Route
                  path="/admin/comments"
                  element={
                    <AdminRoute>
                      <ManageComments />
                    </AdminRoute>
                  }
                />

                {/* Release Management */}
                <Route
                  path="/admin/releases"
                  element={
                    <AdminRoute>
                      <ManageReleases />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/releases/create"
                  element={
                    <AdminRoute>
                      <ReleaseForm />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/releases/edit/:id"
                  element={
                    <AdminRoute>
                      <ReleaseForm />
                    </AdminRoute>
                  }
                />

                {/* Poll Management */}
                <Route
                  path="/admin/polls"
                  element={
                    <AdminRoute>
                      <ManagePolls />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/polls/create"
                  element={
                    <AdminRoute>
                      <CreatePoll />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/polls/edit/:id"
                  element={
                    <AdminRoute>
                      <EditPoll />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/polls/:id"
                  element={
                    <AdminRoute>
                      <PollDetails />
                    </AdminRoute>
                  }
                />

                {/* Website Settings */}
                <Route
                  path="/admin/settings"
                  element={
                    <AdminRoute>
                      <WebsiteSettings />
                    </AdminRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </MaintenanceGate>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;