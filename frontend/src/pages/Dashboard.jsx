// frontend/src/pages/Dashboard.jsx

import { useParams } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import {
  StatCard,
  TasksByStatusChart,
  TasksByPriorityChart,
  TeamWorkloadChart,
  MemberStatsTable,
} from '../components/dashboard';
import { Spinner, Alert } from '../components/ui';
import { useDashboard, useProject } from '../hooks';

const Dashboard = () => {
  const { projectId } = useParams();
  const { data: project } = useProject(projectId);
  const { data: stats, isLoading, error } = useDashboard(projectId);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center pt-20">
          <Spinner size="lg" className="text-primary" />
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="p-6">
          <Alert message="Failed to load dashboard" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="text-sm text-navy-500 mt-0.5">{project?.name} · Project overview</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Tasks"
            value={stats?.totalTasks}
            icon="📋"
            color="blue"
          />
          <StatCard
            label="Completed"
            value={stats?.completedTasks}
            icon="✅"
            color="green"
            sub={`${stats?.completionRate ?? 0}% completion rate`}
          />
          <StatCard
            label="Overdue"
            value={stats?.overdueCount}
            icon="⚠️"
            color="red"
            sub="Past due date"
          />
          <StatCard
            label="Team Members"
            value={stats?.memberStats?.length}
            icon="👥"
            color="yellow"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <TasksByStatusChart data={stats?.tasksByStatus} />
          <TasksByPriorityChart data={stats?.tasksByPriority} />
          <TeamWorkloadChart memberStats={stats?.memberStats} />
        </div>

        {/* Member table */}
        <MemberStatsTable memberStats={stats?.memberStats} />
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
