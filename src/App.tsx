/**
 * App Component
 * Main application component with routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { FeedPage } from '@/pages/FeedPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { AdminUsersPage } from '@/pages/AdminUsersPage';
import { AdminReportsPage } from '@/pages/AdminReportsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { PetsPage } from '@/pages/PetsPage';
import { UserProfilePage } from '@/pages/UserProfilePage';
import { SearchPage } from '@/pages/SearchPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pets"
              element={
                <ProtectedRoute>
                  <PetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:userId"
              element={<UserProfilePage />}
            />
            <Route path="/search" element={<SearchPage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminReportsPage />
                </AdminRoute>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
