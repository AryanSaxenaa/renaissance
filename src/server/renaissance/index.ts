import z from 'zod';
import { AuthError } from 'modelence';
import { Module, ObjectId, UserInfo } from 'modelence/server';
import { dbPatents, dbRemixProjects, dbSearchHistory, dbArxivPapers } from './db';
import { arxivScannerCron, runArxivScanManually } from './cron';
import { analyzePatentWithGemini, generateBlueprintImage, analyzeMechanicalGaps } from './gemini';
import { searchGooglePatents, getPatentById, searchPatentsByProblemStatement } from './patents';

// Generate blueprint SVG based on patent division
function generateBlueprintSvg(patent: { division: string }): string {
  const baseShapes: Record<string, string> = {
    MECH_ENG: `
      <circle cx="0" cy="0" r="80" stroke-dasharray="8 4" opacity="0.5"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(0)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(45)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(90)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(135)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(180)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(225)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(270)"/>
      <path d="M-90 -10 L-90 10 L-70 10 L-70 -10 Z" transform="rotate(315)"/>
      <path d="M120 -40 L160 -60 L160 20 L120 40 Z"/>
      <path d="M160 -60 L200 -40 L200 40 L160 20 Z"/>
    `,
    FLUID_DYN: `
      <ellipse cx="0" cy="0" rx="100" ry="60" stroke-dasharray="4 2"/>
      <path d="M-60 0 Q-30 -40 0 0 Q30 40 60 0" fill="none"/>
      <circle cx="-80" cy="0" r="20"/>
      <circle cx="80" cy="0" r="20"/>
      <path d="M-120 -30 L-100 -30 L-100 30 L-120 30" fill="none"/>
      <path d="M120 -30 L100 -30 L100 30 L120 30" fill="none"/>
    `,
    THERMO_ENG: `
      <rect x="-80" y="-60" width="160" height="120" stroke-dasharray="6 3"/>
      <circle cx="0" cy="0" r="40"/>
      <path d="M-40 0 L40 0" stroke-dasharray="2 2"/>
      <path d="M0 -40 L0 40" stroke-dasharray="2 2"/>
      <rect x="-100" y="-20" width="20" height="40" fill="none"/>
      <rect x="80" y="-20" width="20" height="40" fill="none"/>
    `,
    INSTRUM: `
      <circle cx="0" cy="0" r="70"/>
      <path d="M-50 0 A50 50 0 0 1 50 0" fill="none" stroke-dasharray="5 2"/>
      <line x1="0" y1="0" x2="0" y2="-50"/>
      <circle cx="0" cy="0" r="5" fill="currentColor"/>
      <text x="0" y="30" text-anchor="middle" font-size="10">FLOW</text>
    `,
    HYDRAUL: `
      <ellipse cx="0" cy="0" rx="50" ry="80"/>
      <path d="M-50 0 Q0 20 50 0" fill="none"/>
      <path d="M-40 -40 L40 -40" stroke-dasharray="3 3"/>
      <circle cx="0" cy="-60" r="10"/>
      <rect x="-60" y="60" width="120" height="20" fill="none"/>
    `,
  };

  const shape = baseShapes[patent.division] || baseShapes.MECH_ENG;

  return `<svg viewBox="0 0 800 450" class="w-full h-full opacity-70">
    <g fill="none" stroke="currentColor" stroke-width="1.2" transform="translate(400, 225) scale(1.2)">
      ${shape}
      <path d="M-200 100 Q -100 150, 0 80" opacity="0.6" stroke-dasharray="2 2"/>
      <path d="M-200 110 Q -100 160, 0 90" opacity="0.4" stroke-dasharray="2 2"/>
      <line class="leader-line opacity-50" x1="0" y1="0" x2="-150" y2="-120"/>
      <line class="leader-line opacity-50" x1="80" y1="-20" x2="180" y2="-100"/>
    </g>
  </svg>`;
}

export default new Module('renaissance', {
  stores: [dbPatents, dbRemixProjects, dbSearchHistory, dbArxivPapers],

  queries: {
    // Search for expired patents using real Google Patents API
    searchPatents: async (args: unknown, { user }: { user: UserInfo | null }) => {
      const { query } = z.object({ query: z.string() }).parse(args);

      console.log(`[Renaissance] Searching patents with query: ${query}`);

      try {
        // Use real Google Patents API via SerpApi
        const results = await searchGooglePatents(query, {
          maxResults: 10,
          onlyExpired: true,
          beforeYear: 2005, // 20+ years old
        });

        // Store search history if user is logged in
        if (user) {
          await dbSearchHistory.insertOne({
            userId: new ObjectId(user.id),
            query,
            resultsCount: results.length,
            createdAt: new Date(),
          });
        }

        console.log(`[Renaissance] Found ${results.length} expired patents`);

        return results.map((p) => ({
          patentId: p.patentId,
          title: p.title,
          abstract: p.abstract,
          filingYear: p.filingDate.getFullYear(),
          expiryYear: p.expiryYear,
          isExpired: p.isExpired,
          division: p.division,
          inventors: p.inventors,
          claims: p.claims,
          pdfUrl: p.pdfUrl,
          thumbnailUrl: p.thumbnailUrl,
        }));
      } catch (error) {
        console.error('[Renaissance] Patent search error:', error);
        throw new Error(`Patent search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    // Search patents by problem statement (AI-enhanced query)
    searchByProblem: async (args: unknown, { user }: { user: UserInfo | null }) => {
      const { problemStatement } = z.object({ problemStatement: z.string() }).parse(args);

      console.log(`[Renaissance] Searching patents by problem: ${problemStatement}`);

      try {
        const results = await searchPatentsByProblemStatement(problemStatement, 10);

        if (user) {
          await dbSearchHistory.insertOne({
            userId: new ObjectId(user.id),
            query: problemStatement,
            resultsCount: results.length,
            createdAt: new Date(),
          });
        }

        return results.map((p) => ({
          patentId: p.patentId,
          title: p.title,
          abstract: p.abstract,
          filingYear: p.filingDate.getFullYear(),
          expiryYear: p.expiryYear,
          isExpired: p.isExpired,
          division: p.division,
          inventors: p.inventors,
          claims: p.claims,
          pdfUrl: p.pdfUrl,
          thumbnailUrl: p.thumbnailUrl,
        }));
      } catch (error) {
        console.error('[Renaissance] Problem-based search error:', error);
        throw new Error(`Patent search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    // Get a single patent by ID using real API
    getPatent: async (args: unknown) => {
      const { patentId } = z.object({ patentId: z.string() }).parse(args);

      console.log(`[Renaissance] Fetching patent: ${patentId}`);

      try {
        const patent = await getPatentById(patentId);
        if (!patent) {
          throw new Error('Patent not found');
        }

        return {
          patentId: patent.patentId,
          title: patent.title,
          abstract: patent.abstract,
          filingDate: patent.filingDate,
          filingYear: patent.filingDate.getFullYear(),
          expiryYear: patent.expiryYear,
          isExpired: patent.isExpired,
          division: patent.division,
          inventors: patent.inventors,
          claims: patent.claims,
          pdfUrl: patent.pdfUrl,
          thumbnailUrl: patent.thumbnailUrl,
        };
      } catch (error) {
        console.error('[Renaissance] Get patent error:', error);
        throw new Error(`Failed to fetch patent: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    // Analyze mechanical gaps in a patent
    analyzeMechanicalGaps: async (args: unknown) => {
      const { patentId, title, abstract, claims } = z.object({
        patentId: z.string(),
        title: z.string(),
        abstract: z.string(),
        claims: z.array(z.string()),
      }).parse(args);

      console.log(`[Renaissance] Analyzing mechanical gaps for: ${patentId}`);

      const analysis = await analyzeMechanicalGaps({ patentId, title, abstract, claims });
      return analysis;
    },

    // Quick AI analysis preview for search results (provides real-time feedback)
    analyzePatentPreview: async (args: unknown) => {
      const { patentId, title, abstract } = z.object({
        patentId: z.string(),
        title: z.string(),
        abstract: z.string(),
        division: z.string(), // Kept for API consistency but not used in this query
      }).parse(args);

      console.log(`[Renaissance] Quick AI preview for: ${patentId}`);

      // Use Gemini for quick analysis
      try {
        const { analyzeMechanicalGaps: analyzeGaps } = await import('./gemini');
        const result = await analyzeGaps({
          patentId,
          title,
          abstract,
          claims: ['Patent analysis request'],
        });

        return {
          patentId,
          overallAssessment: result.overallAssessment,
          topGap: result.gaps[0] || null,
          modernizationPotential: result.gaps.length >= 3 ? 'HIGH' : result.gaps.length >= 2 ? 'MEDIUM' : 'LOW',
        };
      } catch (error) {
        console.error(`[Renaissance] Preview analysis error:`, error);
        return {
          patentId,
          overallAssessment: 'Analysis pending - Gemini API temporarily unavailable',
          topGap: null,
          modernizationPotential: 'UNKNOWN',
        };
      }
    },

    // Get user's remix projects
    getProjects: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }

      const projects = await dbRemixProjects.fetch(
        { userId: new ObjectId(user.id) },
        { sort: { createdAt: -1 }, limit: 50 }
      );

      return projects.map((p) => ({
        _id: p._id.toString(),
        title: p.title,
        description: p.description,
        sourcePatentId: p.sourcePatentId,
        sourcePatentTitle: p.sourcePatentTitle,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        materialUpdatesCount: p.materialUpdates?.length || 0,
      }));
    },

    // Get a single remix project with full details
    getProject: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }

      const { projectId } = z.object({ projectId: z.string() }).parse(args);

      const project = await dbRemixProjects.requireOne({ _id: new ObjectId(projectId) });

      if (project.userId.toString() !== user.id) {
        throw new AuthError('Not authorized');
      }

      return {
        _id: project._id.toString(),
        title: project.title,
        description: project.description,
        sourcePatentId: project.sourcePatentId,
        sourcePatentTitle: project.sourcePatentTitle,
        status: project.status,
        blueprintSvg: project.blueprintSvg,
        blueprintImageBase64: project.blueprintImageBase64 || '',
        modernizations: project.modernizations,
        properties: project.properties,
        thoughtLog: project.thoughtLog,
        materialUpdates: project.materialUpdates,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      };
    },

    // Get search history
    getSearchHistory: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }

      const history = await dbSearchHistory.fetch(
        { userId: new ObjectId(user.id) },
        { sort: { createdAt: -1 }, limit: 20 }
      );

      return history.map((h) => ({
        _id: h._id.toString(),
        query: h.query,
        resultsCount: h.resultsCount,
        createdAt: h.createdAt,
      }));
    },

    // Get recent ArXiv papers from database
    getArxivPapers: async (_args: unknown) => {
      const papers = await dbArxivPapers.fetch(
        {},
        { sort: { processedAt: -1 }, limit: 20 }
      );

      return papers.map((p) => ({
        arxivId: p.arxivId,
        title: p.title,
        abstract: p.abstract,
        authors: p.authors,
        publishedDate: p.publishedDate,
        categories: p.categories,
        relevantMaterials: p.relevantMaterials,
        processedAt: p.processedAt,
      }));
    },
  },

  mutations: {
    // Create a new remix project from a patent using real Gemini AI
    createRemixProject: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }

      const { patentId, title, abstract, claims, division, expiryYear } = z.object({
        patentId: z.string(),
        title: z.string(),
        abstract: z.string(),
        claims: z.array(z.string()),
        division: z.string(),
        expiryYear: z.number(),
      }).parse(args);

      console.log(`[Renaissance] Creating remix project for patent: ${patentId}`);
      console.log(`[Renaissance] Calling Gemini AI for analysis...`);

      // Use real Gemini AI to analyze the patent
      const analysis = await analyzePatentWithGemini({
        patentId,
        title,
        abstract,
        claims,
        division,
        expiryYear,
      });

      console.log(`[Renaissance] Gemini AI analysis complete`);
      console.log(`[Renaissance] Modernizations: ${analysis.modernizations.length}`);

      // Generate blueprint SVG (fallback) and attempt AI image generation
      const blueprintSvg = generateBlueprintSvg({ division });

      // Try to generate AI blueprint image
      console.log(`[Renaissance] Generating AI blueprint image...`);
      let blueprintImageBase64: string | null = null;
      try {
        const imageResult = await generateBlueprintImage(
          { title, abstract, division },
          analysis.modernizations
        );
        blueprintImageBase64 = imageResult.imageBase64;
        if (blueprintImageBase64) {
          console.log(`[Renaissance] AI blueprint image generated successfully`);
        }
      } catch (imageError) {
        console.error(`[Renaissance] AI image generation failed, using SVG fallback:`, imageError);
      }

      const now = new Date();

      const result = await dbRemixProjects.insertOne({
        userId: new ObjectId(user.id),
        title: `Modernized: ${title}`,
        description: `AI-generated modernization of expired patent ${patentId} using Gemini AI analysis`,
        sourcePatentId: patentId,
        sourcePatentTitle: title,
        status: 'remixed',
        blueprintSvg,
        blueprintImageBase64: blueprintImageBase64 || '',
        modernizations: analysis.modernizations,
        properties: analysis.properties,
        thoughtLog: analysis.thoughtLog,
        materialUpdates: [],
        createdAt: now,
        updatedAt: now,
      });

      console.log(`[Renaissance] Project created: ${result.insertedId}`);

      return {
        projectId: result.insertedId.toString(),
        hasBlueprintImage: !!blueprintImageBase64,
      };
    },

    // Update a remix project
    updateProject: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }

      const { projectId, title, description, status } = z.object({
        projectId: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(['draft', 'analyzing', 'remixed', 'archived']).optional(),
      }).parse(args);

      const project = await dbRemixProjects.requireOne({ _id: new ObjectId(projectId) });

      if (project.userId.toString() !== user.id) {
        throw new AuthError('Not authorized');
      }

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (status) updateData.status = status;

      await dbRemixProjects.updateOne(
        { _id: new ObjectId(projectId) },
        { $set: updateData }
      );

      return { success: true };
    },

    // Delete a remix project
    deleteProject: async (args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }

      const { projectId } = z.object({ projectId: z.string() }).parse(args);

      const project = await dbRemixProjects.requireOne({ _id: new ObjectId(projectId) });

      if (project.userId.toString() !== user.id) {
        throw new AuthError('Not authorized');
      }

      await dbRemixProjects.deleteOne({ _id: new ObjectId(projectId) });

      return { success: true };
    },

    // Manually trigger ArXiv scan (for testing)
    triggerArxivScan: async (_args: unknown, { user }: { user: UserInfo | null }) => {
      if (!user) {
        throw new AuthError('Not authenticated');
      }

      console.log('[Renaissance] Manual ArXiv scan triggered by user:', user.handle);

      const result = await runArxivScanManually();

      return {
        papersProcessed: result.papersProcessed,
        projectsUpdated: result.projectsUpdated,
        errors: result.errors,
      };
    },
  },

  cronJobs: {
    arxivScanner: arxivScannerCron,
  },
});
