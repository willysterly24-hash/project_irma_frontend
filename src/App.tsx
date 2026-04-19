import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { useAuth } from './useAuth';
import { ProtectedRoute } from './Protectedroute';

import LandingPage from "./LandingPage";
import AdminDashboard from "./components/Admin/AdminDashboard";
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import Dashboards from './Dashboards';
import './index.css';

function AppRoutes() {
    const { isAuthenticated, getRedirect } = useAuth();

    return (
        <Routes>
            <Route path="/" element={
                isAuthenticated ? <Navigate to={getRedirect()} replace /> : <LandingPage />
            } />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/dashboard/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                </ProtectedRoute>
            } />

            <Route path="/dashboards/user" element={
                <ProtectedRoute allowedRoles={['user']}>
                    <Dashboards />
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <div className="font-body bg-white text-navy overflow-x-hidden">
            <BrowserRouter>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}
