import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthSuccessPage from './pages/OAuthSuccessPage';
import OnboardingConnectPage from './pages/OnboardingConnectPage';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import PublicPortfolioPage from './pages/PublicPortfolioPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AIInsightsPage from './pages/AIInsightsPage';
import ProblemsPage from './pages/ProblemsPage';
import RepositoriesPage from './pages/RepositoriesPage';
import GoalsPage from './pages/GoalsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/oauth-success" element={<OAuthSuccessPage />} />
            <Route path="/onboarding/connect" element={<OnboardingConnectPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/u/:username" element={<PublicPortfolioPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/ai-insights" element={<AIInsightsPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/repositories" element={<RepositoriesPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
