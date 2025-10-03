
import React from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';

// Layouts and Protected Routes
import Header from './components/Header';
import DormitoryHeader from './components/DormitoryHeader';
import RoleProtectedRoute from './components/ProtectedRoute';

// Main Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';

// Academic Pages
import HomePage from './pages/HomePage';
import PermissionPage from './pages/PermissionPage';
import AttendancePage from './pages/AttendancePage';
import GeneralReportPage from './pages/GeneralReportPage';
import StudentReportPage from './pages/StudentReportPage';
import ClassReportPage from './pages/ClassReportPage';

// Dormitory Pages
import DormitoryPermissionPage from './pages/dormitory/DormitoryPermissionPage';
import DormitoryReportPage from './pages/dormitory/DormitoryReportPage';

// Layout for academic pages
const AcademicLayout: React.FC = () => (
  <>
    <Header />
    <Outlet />
  </>
);

// Layout for dormitory pages
const DormitoryLayout: React.FC = () => (
    <>
      <DormitoryHeader />
      <Outlet />
    </>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <div className="bg-[#F9FAFB] min-h-screen">
            <main>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Authenticated users can see the landing page */}
                <Route path="/" element={<LandingPage />} />

                {/* Protected Routes based on Roles */}
                <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminPage />} />
                </Route>
                
                <Route element={<RoleProtectedRoute allowedRoles={['admin', 'academic']} />}>
                  <Route path="/academic" element={<AcademicLayout />}>
                    <Route path="dashboard" element={<HomePage />} />
                    <Route path="permission" element={<PermissionPage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="report/general" element={<GeneralReportPage />} />
                    <Route path="report/student" element={<StudentReportPage />} />
                    <Route path="report/class" element={<ClassReportPage />} />
                    <Route index element={<Navigate to="dashboard" replace />} />
                  </Route>
                </Route>
                
                <Route element={<RoleProtectedRoute allowedRoles={['admin', 'dormitory']} />}>
                  <Route path="/dormitory" element={<DormitoryLayout />}>
                    <Route path="permission" element={<DormitoryPermissionPage />} />
                    <Route path="report" element={<DormitoryReportPage />} />
                    <Route index element={<Navigate to="permission" replace />} />
                  </Route>
                </Route>
                
              </Routes>
            </main>
          </div>
        </HashRouter>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;