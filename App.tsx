import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';

import HomePage from './pages/HomePage';
import PermissionPage from './pages/PermissionPage';
import AttendancePage from './pages/AttendancePage';
import GeneralReportPage from './pages/GeneralReportPage';
import StudentReportPage from './pages/StudentReportPage';
import AdminPage from './pages/AdminPage';
import Header from './components/Header';

const AppContent: React.FC = () => {
    const location = useLocation();
    const showHeader = location.pathname !== '/';

    return (
        <div className="bg-[#F9FAFB] min-h-screen">
            {showHeader && <Header />}
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/permission" element={<PermissionPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/report/general" element={<GeneralReportPage />} />
                    <Route path="/report/student" element={<StudentReportPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </main>
        </div>
    );
};


const App: React.FC = () => {
  return (
    <DataProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </DataProvider>
  );
};

export default App;