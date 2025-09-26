import React from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution errors.
import * as ReactRouterDom from 'react-router-dom';
import { DataProvider } from './context/DataContext';

import HomePage from './pages/HomePage';
import PermissionPage from './pages/PermissionPage';
import AttendancePage from './pages/AttendancePage';
import GeneralReportPage from './pages/GeneralReportPage';
import StudentReportPage from './pages/StudentReportPage';
import AdminPage from './pages/AdminPage';
import Header from './components/Header';

const AppContent: React.FC = () => {
    const location = ReactRouterDom.useLocation();
    const showHeader = location.pathname !== '/';

    return (
        <div className="bg-[#F9FAFB] min-h-screen">
            {showHeader && <Header />}
            <main>
                <ReactRouterDom.Routes>
                    <ReactRouterDom.Route path="/" element={<HomePage />} />
                    <ReactRouterDom.Route path="/permission" element={<PermissionPage />} />
                    <ReactRouterDom.Route path="/attendance" element={<AttendancePage />} />
                    <ReactRouterDom.Route path="/report/general" element={<GeneralReportPage />} />
                    <ReactRouterDom.Route path="/report/student" element={<StudentReportPage />} />
                    <ReactRouterDom.Route path="/admin" element={<AdminPage />} />
                </ReactRouterDom.Routes>
            </main>
        </div>
    );
};


const App: React.FC = () => {
  return (
    <DataProvider>
      <ReactRouterDom.HashRouter>
        <AppContent />
      </ReactRouterDom.HashRouter>
    </DataProvider>
  );
};

export default App;
