// frontend/src/pages/Projects.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Modal, Button, Alert, Spinner, Avatar } from '../components/ui';
import { useProjects, useCreateProject, useProject, useAddMember, useRemoveMember } from '../hooks';
import { getErrorMessage } from '../utils';
import { useAuth } from '../context/AuthContext';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const createProject = useCreateProject();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');

  const generateKey = (n) =>
    n.toUpperCase().replace(/[^A-Z0-9\s]/g, '').split(/\s+/).map((w) => w[0]).join('').slice(0, 6);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !key) { setError('Name and key are required'); return; }
    if (key.length < 2) { setError('Key must be at least 2 characters'); return; }
    try {
      const res = await createProject.mutateAsync({ name, key: key.toUpperCase(), description });
      setName(''); setKey(''); setDescription('');
      onClose();
      navigate(`/projects/${res.data.data.project.id}/board`);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleClose = () => { setName(''); setKey(''); setDescription(''); setError(''); onClose(); };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create project">
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <Alert message={error} className="mb-2" />
        <div>
          <label className="label">Project Name</label>
          <input className="input" placeholder="e.g. Backend API" value={name}
            onChange={(e) => { setName(e.target.value); setKey(generateKey(e.target.value)); }} />
        </div>
        <div>
          <label className="label">Project Key</label>
          <input className="input" placeholder="e.g. BAK" value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))} />
          <p className="text-xs text-navy-400 mt-1">Uppercase letters/numbers only.</p>
        </div>
        <div>
          <label className="label">Description <span className="text-navy-400 font-normal normal-case">(optional)</span></label>
          <textarea className="input resize-none" rows={3} placeholder="What is this project about?"
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex gap-2 justify-end pt-2 border-t border-navy-100">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" loading={createProject.isPending}>Create project</Button>
        </div>
      </form>
    </Modal>
  );
};

const ManageMembersModal = ({ isOpen, onClose, projectId }) => {
  const { data: project, isLoading } = useProject(projectId);
  const addMember = useAddMember(projectId);
  const removeMember = useRemoveMember(projectId);
  const { user: currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email) { setError('Email is required'); return; }
    try {
      await addMember.mutateAsync({ email, role });
      setEmail(''); setRole('MEMBER');
      setSuccess('Member added successfully');
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const handleRemove = async (uid, memberName) => {
    if (!confirm(`Remove ${memberName} from this project?`)) return;
    setError(''); setSuccess('');
    try {
      await removeMember.mutateAsync(uid);
      setSuccess('Member removed');
    } catch (err) { setError(getErrorMessage(err)); }
  };

  const signupUrl = `${window.location.origin}/signup`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Members" size="lg">
      <div className="p-6 space-y-6">
        <div className="p-3 bg-navy-50 rounded-lg border border-navy-100">
          <p className="text-xs font-semibold text-navy-600 mb-1">📎 Share signup link with teammates</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-navy-700 flex-1 truncate">{signupUrl}</code>
            <button onClick={() => { navigator.clipboard.writeText(signupUrl); alert('Copied!'); }}
              className="text-xs text-primary hover:underline shrink-0 font-medium">Copy</button>
          </div>
          <p className="text-xs text-navy-400 mt-1">They must sign up first, then add them by email below.</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-navy-800 mb-3">Add Member by Email</h3>
          <Alert message={error} className="mb-3" />
          <Alert type="success" message={success} className="mb-3" />
          <form onSubmit={handleAdd} className="flex gap-2">
            <input className="input flex-1" type="email" placeholder="colleague@company.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <select className="input w-32" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
            <Button type="submit" loading={addMember.isPending}>Add</Button>
          </form>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-navy-800 mb-3">
            Current Members ({project?.members?.length || 0})
          </h3>
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner className="text-primary" /></div>
          ) : (
            <div className="divide-y divide-navy-50 border border-navy-100 rounded-lg overflow-hidden">
              {project?.members?.map((m) => (
                <div key={m.user.id} className="flex items-center gap-3 px-4 py-3 bg-white">
                  <Avatar user={m.user} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900 truncate">
                      {m.user.name}
                      {m.user.id === currentUser?.id && <span className="ml-2 text-xs text-navy-400">(you)</span>}
                    </p>
                    <p className="text-xs text-navy-500 truncate">{m.user.email}</p>
                  </div>
                  <span className={`badge text-xs ${m.role === 'ADMIN'
                    ? 'bg-primary-50 text-primary border border-primary-100'
                    : 'bg-navy-50 text-navy-600 border border-navy-100'}`}>
                    {m.role}
                  </span>
                  {m.user.id !== currentUser?.id && (
                    <Button size="xs" variant="ghost" className="text-danger hover:bg-red-50 ml-2"
                      onClick={() => handleRemove(m.user.id, m.user.name)}
                      loading={removeMember.isPending}>
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

const WaitingForAdmin = ({ user }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
    <div className="w-20 h-20 bg-navy-100 rounded-full flex items-center justify-center mb-6">
      <svg className="w-10 h-10 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <h2 className="text-xl font-bold text-navy-900 mb-2">Welcome, {user?.name}!</h2>
    <p className="text-navy-500 text-sm max-w-sm mb-2">
      Your account is ready but you haven't been added to any projects yet.
    </p>
    <p className="text-navy-400 text-sm max-w-sm mb-8">
      Share your email with a <span className="font-semibold text-navy-600">project Admin</span> and
      ask them to add you to a project.
    </p>
    <div className="bg-white border border-navy-200 rounded-lg px-6 py-4 mb-6 shadow-card">
      <p className="text-xs text-navy-500 mb-1 uppercase tracking-wide font-semibold">Your account email</p>
      <p className="text-base font-mono font-semibold text-navy-900">{user?.email}</p>
      <button
        onClick={() => { navigator.clipboard.writeText(user?.email || ''); alert('Email copied!'); }}
        className="text-xs text-primary hover:underline mt-2"
      >
        Copy email
      </button>
    </div>
    <div className="flex items-center gap-2 text-xs text-navy-400">
      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      Only Admins can create projects and invite members
    </div>
  </div>
);

const Projects = () => {
  const { data: projects, isLoading, error } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [managingProjectId, setManagingProjectId] = useState(null);

  // Simple clean rules:
  const isAdmin = projects?.some((p) => p.role === 'ADMIN');
  const isMemberOnly = projects?.length > 0 && !isAdmin;
  const isNewUser = !isLoading && !error && projects?.length === 0;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-6 py-8">

        {isNewUser && <WaitingForAdmin user={user} />}

        {!isNewUser && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-navy-900">Projects</h1>
                <p className="text-sm text-navy-500 mt-0.5">
                  {projects?.length || 0} project{projects?.length !== 1 ? 's' : ''}
                </p>
              </div>
              {isAdmin && (
                <Button onClick={() => setShowCreate(true)}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create project
                </Button>
              )}
            </div>

            {isMemberOnly && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-blue-800">You have Member access</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    You can view and work on projects you've been invited to. Only Admins can create new projects.
                  </p>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" className="text-primary" /></div>
            ) : error ? (
              <Alert message="Failed to load projects" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white border border-navy-100 rounded-lg p-5
                                                   hover:border-primary-300 hover:shadow-card transition-all group">
                    <div className="flex items-start gap-3 mb-3 cursor-pointer"
                         onClick={() => navigate(`/projects/${project.id}/board`)}>
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center
                                      text-white font-bold text-sm shrink-0 group-hover:bg-primary-600 transition-colors">
                        {project.key?.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-navy-900 group-hover:text-primary transition-colors truncate">
                          {project.name}
                        </h3>
                        <p className="text-xs text-navy-400 font-mono">{project.key}</p>
                      </div>
                    </div>

                    {project.description && (
                      <p className="text-sm text-navy-500 mb-3 line-clamp-2 cursor-pointer"
                         onClick={() => navigate(`/projects/${project.id}/board`)}>
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-navy-400 pt-3 border-t border-navy-50">
                      <button onClick={() => navigate(`/projects/${project.id}/board`)}
                              className="flex items-center gap-1 hover:text-navy-700">
                        <span className="font-semibold text-navy-600">{project.taskCount}</span> tasks
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (project.role === 'ADMIN') setManagingProjectId(project.id);
                        }}
                        className={`flex items-center gap-1 ${
                          project.role === 'ADMIN' ? 'hover:text-primary cursor-pointer' : 'cursor-default'
                        }`}
                        title={project.role === 'ADMIN' ? 'Click to manage members' : ''}
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="font-semibold text-navy-600">{project.memberCount}</span> members
                        {project.role === 'ADMIN' && (
                          <span className="text-primary ml-1 font-medium">· Manage</span>
                        )}
                      </button>

                      <span className={`badge text-2xs ${
                        project.role === 'ADMIN'
                          ? 'bg-primary-50 text-primary border border-primary-100'
                          : 'bg-navy-50 text-navy-600 border border-navy-100'
                      }`}>
                        {project.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <CreateProjectModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
      {managingProjectId && (
        <ManageMembersModal
          isOpen={!!managingProjectId}
          onClose={() => setManagingProjectId(null)}
          projectId={managingProjectId}
        />
      )}
    </PageWrapper>
  );
};

export default Projects;
