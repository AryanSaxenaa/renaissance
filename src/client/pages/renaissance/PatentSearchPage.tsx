import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiQuery, apiMutation } from '@/client/lib/api';
import { Search, Loader2, AlertCircle, History, ChevronLeft, ChevronRight, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '@/client/components/renaissance/AppLayout';
import ThoughtTerminal, { ThoughtMessage } from '@/client/components/renaissance/ThoughtTerminal';
import PatentCard, { Patent } from '@/client/components/renaissance/PatentCard';
import PatentDetailModal, { PatentDetail, PatentDiligenceBrief } from '@/client/components/renaissance/PatentDetailModal';

interface SearchHistoryItem {
  _id: string;
  query: string;
  resultsCount: number;
  createdAt: string;
}

interface PatentPreviewAnalysis {
  patentId: string;
  overallAssessment: string;
  topGap: { component: string; modernSolution: string } | null;
  modernizationPotential: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
}

export default function PatentSearchPage() {
  const user = { handle: 'PUBLIC OPERATOR' };
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const carouselRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [thoughtMessages, setThoughtMessages] = useState<ThoughtMessage[]>([
    { timestamp: new Date(), message: 'SYSTEM INITIALIZED. READY FOR PATENT DISCOVERY.', type: 'success' },
  ]);
  const [heuristicLoad, setHeuristicLoad] = useState(12.5);
  const [analyzingPatentIndex, setAnalyzingPatentIndex] = useState<number | null>(null);
  const [analyzedPatents, setAnalyzedPatents] = useState<Set<string>>(new Set());

  const { data: diligence, isLoading: isLoadingDiligence } = useQuery({
    ...apiQuery<PatentDiligenceBrief>('renaissance.getPatentDiligence', selectedPatent ? {
      patentId: selectedPatent.patentId,
      title: selectedPatent.title,
      abstract: selectedPatent.abstract,
    } : undefined),
    enabled: !!selectedPatent,
  });

  // Search patents query
  const { data: patents, isLoading: isSearching, error: searchError } = useQuery({
    ...apiQuery<Patent[]>('renaissance.searchPatents', { query: submittedQuery }),
    enabled: submittedQuery.length > 0,
  });

  // Get search history
  const { data: searchHistory } = useQuery({
    ...apiQuery<SearchHistoryItem[]>('renaissance.getSearchHistory'),
    enabled: !!user,
  });

  // Create remix project mutation
  const { mutate: createRemix, isPending: isCreatingRemix } = useMutation({
    ...apiMutation<{ projectId: string; hasBlueprintImage: boolean }>('renaissance.createRemixProject'),
    onSuccess: (data) => {
      setShowModal(false);
      toast.success('Remix project created!');
      navigate(`/laboratory/${data.projectId}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create remix project');
    },
  });

  // AI analysis mutation for patent preview
  const { mutate: analyzePatent, isPending: isAnalyzing } = useMutation({
    ...apiMutation<PatentPreviewAnalysis>('renaissance.analyzePatentPreview'),
    onSuccess: (data) => {
      setAnalyzedPatents((prev) => new Set([...prev, data.patentId]));

      // Add AI analysis results to thought terminal
      setThoughtMessages((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          message: `AI ANALYSIS [${data.patentId}]: ${data.overallAssessment.toUpperCase().slice(0, 80)}${data.overallAssessment.length > 80 ? '...' : ''}`,
          type: 'success',
        },
      ]);

      if (data.topGap) {
        const topGap = data.topGap;
        setThoughtMessages((prev) => [
          ...prev,
          {
            timestamp: new Date(),
            message: `MODERNIZATION OPPORTUNITY: ${topGap.component.toUpperCase()} → ${topGap.modernSolution.toUpperCase().slice(0, 50)}`,
            type: 'info',
          },
        ]);
      }

      setThoughtMessages((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          message: `REMIX POTENTIAL: ${data.modernizationPotential}`,
          type: data.modernizationPotential === 'HIGH' ? 'success' : data.modernizationPotential === 'MEDIUM' ? 'warning' : 'info',
        },
      ]);

      setHeuristicLoad((prev) => Math.min(prev + 15, 95));
    },
    onError: (error) => {
      setThoughtMessages((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          message: `PREVIEW ANALYSIS UNAVAILABLE: ${error instanceof Error ? error.message.toUpperCase() : 'ANALYSIS FAILED'}`,
          type: 'warning',
        },
      ]);
    },
  });

  // Update thought messages on search
  useEffect(() => {
    if (submittedQuery && isSearching) {
      setThoughtMessages((prev) => [
        ...prev,
        { timestamp: new Date(), message: `SCANNING PATENT DATABASE FOR: "${submittedQuery.toUpperCase()}"...`, type: 'info' },
      ]);
      setHeuristicLoad(45);
    }
  }, [submittedQuery, isSearching]);

  useEffect(() => {
    if (patents && patents.length > 0) {
      setThoughtMessages((prev) => [
        ...prev,
        { timestamp: new Date(), message: `FOUND ${patents.length} MATCHING PATENT(S)`, type: 'success' },
        { timestamp: new Date(), message: `INITIALIZING DEEPSEEK AI ANALYSIS ENGINE...`, type: 'info' },
      ]);
      setHeuristicLoad(28);
      setAnalyzedPatents(new Set()); // Reset analyzed patents for new search
      setAnalyzingPatentIndex(0); // Start analyzing from first patent
    } else if (patents && patents.length === 0) {
      setThoughtMessages((prev) => [
        ...prev,
        { timestamp: new Date(), message: 'NO PATENTS FOUND. TRY DIFFERENT KEYWORDS.', type: 'warning' },
      ]);
      setHeuristicLoad(15);
    }
  }, [patents]);

  // Automatically analyze patents one by one using DeepSeek AI
  useEffect(() => {
    if (patents && analyzingPatentIndex !== null && analyzingPatentIndex < patents.length && !isAnalyzing) {
      const patent = patents[analyzingPatentIndex];

      // Skip if already analyzed
      if (analyzedPatents.has(patent.patentId)) {
        setAnalyzingPatentIndex(analyzingPatentIndex + 1);
        return;
      }

      // Add processing message
      setThoughtMessages((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          message: `PROCESSING PATENT ${analyzingPatentIndex + 1}/${patents.length}: ${patent.patentId}...`,
          type: 'info',
        },
      ]);

      // Trigger AI analysis
      analyzePatent({
        patentId: patent.patentId,
        title: patent.title,
        abstract: patent.abstract,
        division: patent.division,
      });

      // Move to next patent after a delay
      setTimeout(() => {
        setAnalyzingPatentIndex((prev) => (prev !== null ? prev + 1 : null));
      }, 2000);
    } else if (patents && analyzingPatentIndex !== null && analyzingPatentIndex >= patents.length) {
      // All patents analyzed
      setThoughtMessages((prev) => [
        ...prev,
        {
          timestamp: new Date(),
          message: 'AI ANALYSIS COMPLETE. SELECT A PATENT TO REMIX.',
          type: 'success',
        },
      ]);
      setAnalyzingPatentIndex(null);
      setHeuristicLoad(12);
    }
  }, [patents, analyzingPatentIndex, isAnalyzing, analyzedPatents, analyzePatent]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim());
      setSelectedPatent(null);
    }
  }, [searchQuery]);

  const handlePatentClick = useCallback((patent: Patent) => {
    setSelectedPatent(patent);
    setShowModal(true);
  }, []);

  const handleRemix = useCallback(() => {
    if (!user) {
      toast.error('Please sign in to create remix projects');
      navigate('/login');
      return;
    }

    if (!selectedPatent) {
      toast.error('Please select a patent to remix');
      return;
    }

    if (!selectedPatent.isExpired) {
      toast.error('Only expired patents can be remixed');
      return;
    }

    setThoughtMessages((prev) => [
      ...prev,
      { timestamp: new Date(), message: `INITIATING REMIX SEQUENCE FOR: ${selectedPatent.patentId}...`, type: 'success' },
      { timestamp: new Date(), message: 'LOADING DEEPSEEK AI PATENT RECOMBINATION MATRIX...', type: 'info' },
      { timestamp: new Date(), message: 'GENERATING MODERNIZATION SUGGESTIONS...', type: 'info' },
    ]);
    setHeuristicLoad(72);

    createRemix({
      patentId: selectedPatent.patentId,
      title: selectedPatent.title,
      abstract: selectedPatent.abstract,
      claims: selectedPatent.claims || [],
      division: selectedPatent.division,
      expiryYear: selectedPatent.expiryYear,
    });
  }, [user, selectedPatent, createRemix, navigate]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <AppLayout
      sidebar={
        <ThoughtTerminal
          messages={thoughtMessages}
          heuristicLoad={heuristicLoad}
          isProcessing={isSearching || isCreatingRemix || isAnalyzing || analyzingPatentIndex !== null}
        />
      }
    >
      <div className="max-w-5xl mx-auto flex flex-col h-full">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">PATENT DISCOVERY</h1>
          <p className="text-sm opacity-60">
            Search the expired patent archive to find innovations ready for modernization
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter problem statement or keywords (e.g., gear assembly, pump, flow meter)"
                className="w-full bg-transparent border border-technical-white/30 px-4 py-3 text-sm focus:ring-1 focus:ring-amber-glow focus:border-amber-glow placeholder:opacity-30 focus:outline-none"
              />
              <Search className="absolute right-4 top-3.5 w-5 h-5 opacity-30" />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="metal-plate px-8 py-3 text-xs tracking-widest flex items-center gap-2 disabled:opacity-50"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              SCAN ARCHIVE
            </button>
          </div>
        </form>

        {/* Search History (if logged in) */}
        {user && searchHistory && searchHistory.length > 0 && !submittedQuery && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-amber-glow" />
              <h3 className="text-xs font-bold tracking-widest opacity-60">RECENT SEARCHES</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 8).map((item) => (
                <button
                  key={item._id}
                  onClick={() => {
                    setSearchQuery(item.query);
                    setSubmittedQuery(item.query);
                  }}
                  className="px-3 py-1 border border-technical-white/20 text-xs hover:bg-technical-white/10 transition-colors flex items-center gap-2"
                >
                  <span>{item.query}</span>
                  <span className="opacity-40">({item.resultsCount})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {searchError && (
          <div className="border border-red-500/30 bg-red-900/20 p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-300">
              {searchError instanceof Error ? searchError.message : 'Failed to search patents'}
            </p>
          </div>
        )}

        {/* Search Results */}
        {patents && patents.length > 0 && (
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold tracking-widest opacity-60">
                SEARCH RESULTS ({patents.length})
              </h2>
            </div>

            {/* Full Patent Cards */}
            <div className="grid gap-4 flex-1 overflow-auto scrollbar-blueprint pr-2">
              {patents.map((patent) => (
                <PatentCard
                  key={patent.patentId}
                  patent={patent}
                  onClick={() => handlePatentClick(patent)}
                  isSelected={selectedPatent?.patentId === patent.patentId}
                />
              ))}
            </div>

            {/* Compact Carousel at Bottom */}
            <div className="mt-6 pt-6 border-t border-technical-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold tracking-widest opacity-60">QUICK ACCESS CAROUSEL</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollCarousel('left')}
                    className="p-1 border border-technical-white/20 hover:bg-technical-white/10 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    className="p-1 border border-technical-white/20 hover:bg-technical-white/10 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto pb-2 scrollbar-blueprint"
              >
                {patents.map((patent) => (
                  <PatentCard
                    key={`compact-${patent.patentId}`}
                    patent={patent}
                    onClick={() => handlePatentClick(patent)}
                    isSelected={selectedPatent?.patentId === patent.patentId}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!submittedQuery && (
          <div className="text-center py-16 border border-technical-white/10 bg-cyanotype-dark/50 flex-1 flex flex-col items-center justify-center">
            <Database className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-bold mb-2 opacity-60">AWAITING QUERY PARAMETERS</h3>
            <p className="text-sm opacity-40 max-w-md mx-auto">
              Enter a problem statement or keywords to search the expired patent database.
              Only patents 20+ years old are available for remix.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              {['gear assembly', 'pump', 'hydraulic', 'steam engine', 'flow meter'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    setSubmittedQuery(term);
                  }}
                  className="px-3 py-1 border border-technical-white/20 text-xs hover:bg-technical-white/10 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {submittedQuery && patents && patents.length === 0 && (
          <div className="text-center py-16 border border-technical-white/10 bg-cyanotype-dark/50 flex-1 flex flex-col items-center justify-center">
            <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-lg font-bold mb-2 opacity-60">NO PATENTS FOUND</h3>
            <p className="text-sm opacity-40">
              Try different keywords or broaden your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Patent Detail Modal */}
      {showModal && selectedPatent && (
        <PatentDetailModal
          patent={selectedPatent as PatentDetail}
          onClose={() => setShowModal(false)}
          onRemix={handleRemix}
          isRemixing={isCreatingRemix}
          diligence={diligence}
          isLoadingDiligence={isLoadingDiligence}
        />
      )}
    </AppLayout>
  );
}
