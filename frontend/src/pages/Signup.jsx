// frontend/src/pages/Signup.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Alert } from '../components/ui';
import { getErrorMessage } from '../utils';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Full name is required'); return; }
    if (name.trim().length < 2) { setError('Name must be at least 2 characters'); return; }
    if (!email.trim()) { setError('Email is required'); return; }
    if (!password) { setError('Password is required'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(password)) { setError('Password must contain at least one uppercase letter'); return; }
    if (!/[0-9]/.test(password)) { setError('Password must contain at least one number'); return; }

    setIsLoading(true);
    try {
      await signup({ name: name.trim(), email: email.trim(), password });
      navigate('/projects');
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
          <h1 className="text-xl font-bold text-navy-900 mb-1">Create your account</h1>
          <p className="text-sm text-navy-500 mb-6">
            Sign up to join your team on TaskFlow
          </p>

          <Alert message={error} className="mb-4" />

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Alex Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>

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
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <p className="text-xs text-navy-400 mt-1">
                At least 8 characters, one uppercase letter, one number
              </p>
            </div>

            <Button type="submit" className="w-full" loading={isLoading}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-navy-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded">
            <p className="text-xs text-amber-700 font-medium mb-1">ℹ️ Note</p>
            <p className="text-xs text-amber-600">
              After signing up, ask your Admin to add you to a project using your email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
