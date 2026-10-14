import React from 'react';
import { Link } from 'react-router-dom';
import DevPulseLogo from '../components/common/DevPulseLogo';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <DevPulseLogo size="lg" />
      <div className="space-y-2">
        <h1 className="text-6xl font-black text-slate-900 dark:text-white">404</h1>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Page Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          The requested page does not exist or has been moved.
        </p>
      </div>
      <Link
        to="/dashboard"
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
