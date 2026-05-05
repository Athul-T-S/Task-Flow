// frontend/src/components/layout/Navbar.jsx

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProject, useProjects } from '../../hooks';
import { Avatar } from '../ui';

const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-primary-200 transition-all"
      >
        <Avatar user={user} size="md" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-modal border border-navy-100 z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-navy-100">
            <p className="text-sm font-semibold text-navy-900">{user?.name}</p>
            <p className="text-xs text-navy-500 truncate">{user?.email}</p>
          </div>
          <div className="p-1">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full text-left px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 rounded transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectSwitcher = ({ projectId }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();
  const { data: projects } = useProjects();
  const { data: project } = useProject(projectId);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-navy-800 
                   hover:bg-navy-100 rounded transition-colors"
      >
        {project ? (
          <>
            <span className="w-5 h-5 bg-primary rounded text-white text-xs font-bold flex items-center justify-center">
              {project.key?.slice(0, 1)}
            </span>
            <span>{project.name}</span>
          </>
        ) : (
          <span className="text-navy-500">Select project</span>
        )}
        <svg className="w-3 h-3 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && projects && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-modal border border-navy-100 z-50 animate-fade-in">
          <div className="p-2">
            <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider px-2 py-1">
              Your Projects
            </p>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  navigate(`/projects/${p.id}/board`);
                  setOpen(false);
                }}
                className={`w-full text-left flex items-center gap-3 px-2 py-2 rounded text-sm transition-colors ${
                  p.id === projectId
                    ? 'bg-primary-50 text-primary font-medium'
                    : 'text-navy-700 hover:bg-navy-50'
                }`}
              >
                <span className="w-6 h-6 bg-primary rounded text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {p.key?.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-xs text-navy-400">{p.taskCount} tasks · {p.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-14 right-0 h-12 bg-white border-b border-navy-100 z-30 
                       flex items-center px-4 gap-4">
      {/* Breadcrumb / Project switcher */}
      <div className="flex items-center gap-2 text-sm text-navy-500">
        <button
          onClick={() => navigate('/projects')}
          className="hover:text-navy-800 transition-colors"
        >
          Projects
        </button>
        {projectId && (
          <>
            <span>/</span>
            <ProjectSwitcher projectId={projectId} />
          </>
        )}
      </div>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notification bell (cosmetic) */}
        <button className="w-8 h-8 flex items-center justify-center text-navy-400 
                           hover:text-navy-700 hover:bg-navy-100 rounded transition-colors relative">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <UserMenu user={user} onLogout={handleLogout} />
      </div>
    </header>
  );
};
