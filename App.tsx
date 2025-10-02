import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';

import HomePage from './pages/HomePage';
import PermissionPage from './pages/PermissionPage';
import AttendancePage from './pages/AttendancePage';
import GeneralReportPage from './pages/GeneralReportPage';
import StudentReportPage from './pages/StudentReportPage';
import ClassReportPage from './pages/ClassReportPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

// Layout untuk halaman yang memiliki header
const LayoutWithHeader: React.FC = () => {
  return (
    <>
      <Header />
      <Outlet /> {/* Komponen halaman anak akan dirender di sini */}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <HashRouter>
          <div className="bg-[#F9FAFB] min-h-screen">
            <main>
              <Routes>
                {/* Rute Publik */}
                <Route path="/login" element={<LoginPage />} />

                {/* Rute yang Dilindungi */}
                <Route element={<ProtectedRoute />}>
                  {/* HomePage tidak menggunakan layout header */}
                  <Route path="/" element={<HomePage />} />
                  
                  {/* Halaman lain menggunakan layout header */}
                  <Route element={<LayoutWithHeader />}>
                    <Route path="/permission" element={<PermissionPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/report/general" element={<GeneralReportPage />} />
                    <Route path="/report/student" element={<StudentReportPage />} />
                    <Route path="/report/class" element={<ClassReportPage />} />
                    <Route path="/admin" element={<AdminPage />} />
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
