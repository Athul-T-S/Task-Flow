// frontend/src/components/layout/PageWrapper.jsx

import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const PageWrapper = ({ children, fullWidth = false }) => {
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar />
      <Navbar />
      <main className={`pt-12 pl-14 min-h-screen ${fullWidth ? '' : ''}`}>
        {children}
      </main>
    </div>
  );
};
