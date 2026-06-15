import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import HealthPage from '../pages/HealthPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import AnalyzerPage from '../pages/AnalyzerPage';
import HistoryPage from '../pages/HistoryPage';
import SharedAnalysisPage from '../pages/SharedAnalysisPage';
import SettingsPage from '../pages/SettingsPage';
import { LanguageCapabilitiesPage } from '../pages/LanguageCapabilitiesPage';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public shared analysis — no auth required */}
        <Route path="/shared/analyses/:token" element={<SharedAnalysisPage />} />


        {/* Protected routes — require auth:sanctum token */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analyzer" element={<AnalyzerPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/languages" element={<LanguageCapabilitiesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

