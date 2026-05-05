// frontend/src/pages/Login.jsx

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Alert } from '../components/ui';
import { getErrorMessage } from '../utils';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = location.state?.from?.pathname || '/projects';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold text-navy-900">TaskFlow</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-card border border-navy-100 p-8">
          <h1 className="text-xl font-bold text-navy-900 mb-1">Log in to TaskFlow</h1>
          <p className="text-sm text-navy-500 mb-6">Enter your credentials to continue</p>
          <Alert message={error} className="mb-4" />
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" loading={isLoading}>
              Log in
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-navy-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-1">Demo credentials (click to fill):</p>
            <p className="text-xs text-blue-600 cursor-pointer hover:underline"
              onClick={() => { setEmail('admin@demo.com'); setPassword('Demo1234'); }}>
              admin@demo.com / Demo1234
            </p>
            <p className="text-xs text-blue-600 cursor-pointer hover:underline"
              onClick={() => { setEmail('member@demo.com'); setPassword('Demo1234'); }}>
              member@demo.com / Demo1234
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
