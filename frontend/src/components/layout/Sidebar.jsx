// frontend/src/components/layout/Sidebar.jsx

import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks';

const NavIcon = ({ children, title }) => (
  <div title={title} className="relative group">
    {children}
    <span className="absolute left-full ml-2 px-2 py-1 bg-navy-900 text-white text-xs rounded 
                     opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
      {title}
    </span>
  </div>
);

export const Sidebar = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { data: projects } = useProjects();

  const navItems = [
    {
      to: projectId ? `/projects/${projectId}/board` : '/projects',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
      ),
      label: 'Board',
      disabled: !projectId,
    },
    {
      to: projectId ? `/projects/${projectId}/dashboard` : '/projects',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      label: 'Dashboard',
      disabled: !projectId,
    },
    {
      to: '/projects',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      label: 'Projects',
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-14 bg-navy-900 flex flex-col items-center py-3 z-40">
      {/* Logo */}
      <button
        onClick={() => navigate('/projects')}
        className="w-8 h-8 bg-primary rounded flex items-center justify-center mb-6 hover:bg-primary-400 transition-colors"
      >
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </button>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col items-center gap-1">
        {navItems.map((item) => (
          <NavIcon key={item.label} title={item.label}>
            {item.disabled ? (
              <div className="w-10 h-10 flex items-center justify-center text-navy-600 rounded cursor-not-allowed">
                {item.icon}
              </div>
            ) : (
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `w-10 h-10 flex items-center justify-center rounded transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-navy-400 hover:bg-navy-700 hover:text-white'
                  }`
                }
              >
                {item.icon}
              </NavLink>
            )}
          </NavIcon>
        ))}
      </nav>

      {/* Project list dots */}
      {projects && projects.length > 0 && (
        <div className="mb-4 flex flex-col items-center gap-1">
          {projects.slice(0, 5).map((p) => (
            <NavIcon key={p.id} title={p.name}>
              <button
                onClick={() => navigate(`/projects/${p.id}/board`)}
                className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center transition-colors ${
                  projectId === p.id
                    ? 'bg-primary text-white'
                    : 'bg-navy-700 text-navy-300 hover:bg-navy-600 hover:text-white'
                }`}
              >
                {p.key?.slice(0, 2)}
              </button>
            </NavIcon>
          ))}
        </div>
      )}
    </div>
  );
};
