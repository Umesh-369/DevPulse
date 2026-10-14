import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DevPulseLogo from '../components/common/DevPulseLogo';
import { useAuth } from '../context/AuthContext';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OAuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [status, setStatus] = useState('authenticating'); // 'authenticating' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function processOAuth() {
      const token = searchParams.get('token');
      const isNewUser = searchParams.get('isNewUser') === 'true';
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(decodeURIComponent(error));
        return;
      }

      if (!token) {
        setStatus('error');
        setErrorMessage('Authentication failed: Missing token in response');
        return;
      }

      try {
        setStatus('authenticating');
        const user = await loginWithToken(token);

        setStatus('success');
        confetti({ particleCount: 70, spread: 60 });

        setTimeout(() => {
          if (isNewUser || user?.isNewUser) {
            navigate('/onboarding/connect', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }, 1200);
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message || 'Failed to initialize session');
      }
    }

    processOAuth();
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B0D11] flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#151922] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <DevPulseLogo size="lg" />
        </div>

        {status === 'authenticating' && (
          <div className="space-y-4 py-4">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Authenticating Session
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Synchronizing your developer profile and telemetry...
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4 animate-in fade-in">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                OAuth Authentication Complete
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Redirecting to your workspace...
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-2 animate-in fade-in">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-base font-bold text-rose-600 dark:text-rose-400">
                Authentication Error
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/40 text-left">
                {errorMessage}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/login', { replace: true })}
                className="w-full py-2.5 px-4 text-xs font-semibold bg-[#111315] text-white dark:bg-[#E5A952] dark:text-[#0B0D11] rounded-xl hover:opacity-90 transition-opacity"
              >
                Return to Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
