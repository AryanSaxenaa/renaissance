import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { modelenceQuery } from '@modelence/react-query';
import { useSession } from 'modelence/client';
import { Loader2, AlertCircle, FolderOpen, Clock, Bell, Search } from 'lucide-react';
import AppLayout from '@/client/components/renaissance/AppLayout';
import ThoughtTerminal from '@/client/components/renaissance/ThoughtTerminal';
import { cn } from '@/client/lib/utils';

interface RemixProjectSummary {
  _id: string;
  title: string;
  description: string;
  sourcePatentId: string;
  sourcePatentTitle: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  materialUpdatesCount: number;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-600',
  analyzing: 'bg-blue-600',
  remixed: 'bg-green-600',
  archived: 'bg-amber-600',
};

export default function ArchivePage() {
  const { user } = useSession();

  // Fetch user's projects
  const { data: projects, isLoading, error } = useQuery({
    ...modelenceQuery<RemixProjectSummary[]>('renaissance.getProjects'),
    enabled: !!user,
  });

  // If not authenticated
  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="w-16 h-16 mb-4 opacity-30" />
          <h2 className="text-xl font-bold mb-2">AUTHENTICATION REQUIRED</h2>
          <p className="text-sm opacity-60 mb-6">Please sign in to access your invention archive</p>
          <Link
            to="/login"
            className="metal-plate px-6 py-3 text-xs tracking-widest"
          >
            SIGN IN
          </Link>
        </div>
      </AppLayout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <AppLayout
        sidebar={
          <ThoughtTerminal
            messages={[{ timestamp: new Date(), message: 'LOADING ARCHIVE INDEX...', type: 'info' }]}
            heuristicLoad={30}
            isProcessing
          />
        }
      >
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin opacity-50" />
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="w-16 h-16 mb-4 text-red-400 opacity-50" />
          <h2 className="text-xl font-bold mb-2">ARCHIVE ERROR</h2>
          <p className="text-sm opacity-60">
            {error instanceof Error ? error.message : 'Unable to load archive'}
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      sidebar={
        <ThoughtTerminal
          messages={[
            { timestamp: new Date(), message: 'ARCHIVE LIBRARY LOADED', type: 'success' },
            { timestamp: new Date(), message: `INDEXED ${projects?.length || 0} REMIX PROJECT(S)`, type: 'info' },
          ]}
          heuristicLoad={15}
        />
      }
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">ARCHIVE LIBRARY</h1>
          <p className="text-sm opacity-60">
            Your collection of modernized patents and invention remixes
          </p>
        </div>

        {/* Projects Grid */}
        {projects && projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project._id}
                to={`/laboratory/${project._id}`}
                className="border border-technical-white/20 bg-cyanotype-dark/80 p-6 hover:border-technical-white/40 transition-all group"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] opacity-50 tracking-widest">
                      REF: {project.sourcePatentId}
                    </span>
                    <h3 className="text-lg font-bold mt-1 group-hover:text-amber-glow transition-colors">
                      {project.title}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-1 uppercase',
                      statusColors[project.status] || 'bg-gray-600'
                    )}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm opacity-60 mb-4 line-clamp-2">{project.description}</p>

                {/* Footer */}
                <div className="flex justify-between items-center text-[10px] pt-4 border-t border-technical-white/10">
                  <div className="flex items-center gap-1 opacity-50">
                    <Clock className="w-3 h-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  {project.materialUpdatesCount > 0 && (
                    <div className="flex items-center gap-1 text-amber-glow">
                      <Bell className="w-3 h-3" />
                      {project.materialUpdatesCount} new material update(s)
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-16 border border-technical-white/10 bg-cyanotype-dark/50">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold mb-2 opacity-60">ARCHIVE EMPTY</h3>
            <p className="text-sm opacity-40 max-w-md mx-auto mb-6">
              Your invention laboratory is empty. Search for expired patents and create your first remix project.
            </p>
            <Link
              to="/"
              className="metal-plate inline-flex items-center gap-2 px-6 py-3 text-xs tracking-widest"
            >
              <Search className="w-4 h-4" />
              SEARCH PATENTS
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
