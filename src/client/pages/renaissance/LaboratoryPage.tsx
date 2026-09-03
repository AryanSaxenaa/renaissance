import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiQuery, apiMutation, createQueryKey } from '@/client/lib/api';
import { Save, Trash2, Loader2, ArrowLeft, AlertCircle, Beaker } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '@/client/components/renaissance/AppLayout';
import ThoughtTerminal, { ThoughtMessage } from '@/client/components/renaissance/ThoughtTerminal';
import BlueprintCanvas from '@/client/components/renaissance/BlueprintCanvas';

interface Modernization {
  aspect: string;
  original: string;
  modernized: string;
  material?: string;
  technicalDetail?: string;
}

interface Properties {
  torque?: string;
  stress?: string;
  material?: string;
  expiryYear?: number;
}

interface MaterialUpdate {
  date: string;
  paperTitle: string;
  paperUrl: string;
  relevantMaterial: string;
  feasibilityChange: string;
}

interface RemixProject {
  _id: string;
  title: string;
  description: string;
  sourcePatentId: string;
  sourcePatentTitle: string;
  status: string;
  blueprintSvg?: string;
  blueprintImageBase64?: string;
  modernizations: Modernization[];
  properties?: Properties;
  thoughtLog: Array<{ timestamp: string; message: string; type: string }>;
  materialUpdates: MaterialUpdate[];
  createdAt: string;
  updatedAt: string;
}

export default function LaboratoryPage() {
  const user = { handle: 'PUBLIC OPERATOR' };
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  const [thoughtMessages, setThoughtMessages] = useState<ThoughtMessage[]>([]);
  const [heuristicLoad, setHeuristicLoad] = useState(0);

  // Fetch project data
  const { data: project, isLoading, error } = useQuery({
    ...apiQuery<RemixProject>('renaissance.getProject', { projectId }),
    enabled: !!projectId && !!user,
  });

  // Update project mutation
  const { mutate: updateProject, isPending: isUpdating } = useMutation({
    ...apiMutation('renaissance.updateProject'),
    onSuccess: () => {
      toast.success('Project saved');
      queryClient.invalidateQueries({ queryKey: createQueryKey('renaissance.getProject', { projectId }) });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to save project');
    },
  });

  // Delete project mutation
  const { mutate: deleteProject, isPending: isDeleting } = useMutation({
    ...apiMutation('renaissance.deleteProject'),
    onSuccess: () => {
      toast.success('Project deleted');
      window.location.href = '/archive';
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete project');
    },
  });

  // Load thought log from project
  useEffect(() => {
    if (project?.thoughtLog) {
      const messages: ThoughtMessage[] = project.thoughtLog.map((log) => ({
        timestamp: new Date(log.timestamp),
        message: log.message,
        type: log.type as 'info' | 'success' | 'error' | 'warning',
      }));
      setThoughtMessages(messages);
      setHeuristicLoad(72.4);
    }
  }, [project]);

  // If not authenticated
  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="w-16 h-16 mb-4 opacity-30" />
          <h2 className="text-xl font-bold mb-2">AUTHENTICATION REQUIRED</h2>
          <p className="text-sm opacity-60 mb-6">Please sign in to access the Remix Laboratory</p>
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

  // If no project ID, show lab overview
  if (!projectId) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <Beaker className="w-16 h-16 mb-4 opacity-30" />
          <h2 className="text-xl font-bold mb-2">REMIX LABORATORY</h2>
          <p className="text-sm opacity-60 mb-6 text-center max-w-md">
            Select a remix project from your archive or search for expired patents to begin modernization
          </p>
          <div className="flex gap-4">
            <Link
              to="/"
              className="metal-plate px-6 py-3 text-xs tracking-widest"
            >
              SEARCH PATENTS
            </Link>
            <Link
              to="/archive"
              className="border border-technical-white/30 px-6 py-3 text-xs tracking-widest hover:bg-technical-white/10 transition-colors"
            >
              VIEW ARCHIVE
            </Link>
          </div>
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
            messages={[{ timestamp: new Date(), message: 'LOADING PROJECT DATA...', type: 'info' }]}
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
  if (error || !project) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <AlertCircle className="w-16 h-16 mb-4 text-red-400 opacity-50" />
          <h2 className="text-xl font-bold mb-2">PROJECT NOT FOUND</h2>
          <p className="text-sm opacity-60 mb-6">
            {error instanceof Error ? error.message : 'Unable to load the requested project'}
          </p>
          <Link
            to="/archive"
            className="border border-technical-white/30 px-6 py-3 text-xs tracking-widest hover:bg-technical-white/10 transition-colors"
          >
            RETURN TO ARCHIVE
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      sidebar={
        <ThoughtTerminal
          messages={thoughtMessages}
          heuristicLoad={heuristicLoad}
          isProcessing={isUpdating}
        />
      }
    >
      {/* Header Bar */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/archive"
            className="p-2 border border-technical-white/30 hover:bg-technical-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-[10px] opacity-50 tracking-widest">REF: {project.sourcePatentId}</p>
            <h1 className="text-xl font-bold">{project.title}</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => updateProject({ projectId, status: 'archived' })}
            disabled={isUpdating}
            className="metal-plate px-4 py-2 text-xs tracking-widest flex items-center gap-2"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            COMMIT REMIX
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this project?')) {
                deleteProject({ projectId });
              }
            }}
            disabled={isDeleting}
            className="p-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Blueprint Canvas */}
      <BlueprintCanvas
        title={project.sourcePatentTitle}
        subtitle={`CROSS-SECTIONAL ASSEMBLY // ${project.status.toUpperCase()}`}
        svgContent={project.blueprintSvg}
        blueprintImageBase64={project.blueprintImageBase64}
        modernizations={project.modernizations}
        properties={project.properties}
        className="flex-1"
      />

      {/* Material Updates Section */}
      {project.materialUpdates && project.materialUpdates.length > 0 && (
        <div className="mt-8 border-t border-technical-white/10 pt-6">
          <h3 className="text-xs font-bold tracking-widest opacity-60 mb-4">
            ARXIV MATERIAL UPDATES ({project.materialUpdates.length})
          </h3>
          <div className="space-y-3">
            {project.materialUpdates.map((update, i) => (
              <div
                key={i}
                className="border border-amber-glow/30 bg-amber-glow/5 p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-bold text-amber-glow">{update.paperTitle}</h4>
                  <span className="text-[10px] opacity-50">
                    {new Date(update.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs opacity-70 mb-2">{update.feasibilityChange}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] opacity-50">Material: {update.relevantMaterial}</span>
                  <a
                    href={update.paperUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-amber-glow hover:underline"
                  >
                    VIEW PAPER
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
