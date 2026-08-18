import { time } from 'modelence';
import { dbArxivPapers, dbRemixProjects } from './db';
import { fetchArxivMaterialSciencePapers, extractMaterialsFromAbstract } from './arxiv';
import { checkPaperRelevance } from './gemini';

export const arxivScannerCron = {
  description: 'Scan ArXiv for new material science papers and update remix projects',
  interval: time.hours(12),
  handler: async () => {
    console.log('[ArXiv Scanner] Starting real ArXiv API material science paper scan...');

    try {
      // Fetch new papers from real ArXiv API
      const papers = await fetchArxivMaterialSciencePapers(15);
      console.log(`[ArXiv Scanner] Fetched ${papers.length} papers from ArXiv API`);

      let newPapersCount = 0;
      let updatedProjectsCount = 0;

      // Process each paper
      for (const paper of papers) {
        // Check if we already have this paper
        const existing = await dbArxivPapers.findOne({ arxivId: paper.arxivId });
        if (existing) {
          console.log(`[ArXiv Scanner] Skipping already processed paper: ${paper.arxivId}`);
          continue;
        }

        // Extract relevant materials from abstract
        const relevantMaterials = extractMaterialsFromAbstract(paper.abstract);

        if (relevantMaterials.length === 0) {
          console.log(`[ArXiv Scanner] No relevant materials found in: ${paper.title}`);
          continue;
        }

        // Store the paper in database
        await dbArxivPapers.insertOne({
          arxivId: paper.arxivId,
          title: paper.title,
          abstract: paper.abstract,
          authors: paper.authors,
          publishedDate: paper.publishedDate,
          categories: paper.categories,
          relevantMaterials,
          processedAt: new Date(),
        });

        newPapersCount++;
        console.log(`[ArXiv Scanner] Stored new paper: ${paper.title}`);
        console.log(`[ArXiv Scanner] Materials found: ${relevantMaterials.join(', ')}`);

        // Find remix projects that might benefit from this paper
        const activeProjects = await dbRemixProjects.fetch({
          status: 'remixed',
        });

        console.log(`[ArXiv Scanner] Checking relevance against ${activeProjects.length} active projects...`);

        for (const project of activeProjects) {
          try {
            // Use Gemini AI to check if paper is relevant to project
            const { isRelevant, feasibilityChange } = await checkPaperRelevance(
              { title: paper.title, abstract: paper.abstract, relevantMaterials },
              { title: project.title, modernizations: project.modernizations }
            );

            if (isRelevant) {
              // Add material update to the project
              const newMaterialUpdates = [
                ...project.materialUpdates,
                {
                  date: new Date(),
                  paperTitle: paper.title,
                  paperUrl: `https://arxiv.org/abs/${paper.arxivId}`,
                  relevantMaterial: relevantMaterials.join(', '),
                  feasibilityChange,
                },
              ];

              await dbRemixProjects.updateOne(
                { _id: project._id },
                {
                  $set: {
                    materialUpdates: newMaterialUpdates,
                    updatedAt: new Date(),
                  },
                }
              );

              updatedProjectsCount++;
              console.log(`[ArXiv Scanner] Updated project "${project.title}" with paper: ${paper.title}`);
              console.log(`[ArXiv Scanner] Feasibility change: ${feasibilityChange}`);
            }
          } catch (projectError) {
            console.error(`[ArXiv Scanner] Error checking relevance for project ${project.title}:`, projectError);
          }

          // Add small delay to avoid rate limiting on Gemini API
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log('[ArXiv Scanner] ========== SCAN COMPLETE ==========');
      console.log(`[ArXiv Scanner] New papers processed: ${newPapersCount}`);
      console.log(`[ArXiv Scanner] Projects updated: ${updatedProjectsCount}`);
    } catch (error) {
      console.error('[ArXiv Scanner] Critical error during scan:', error);
    }
  },
};

/**
 * Manual trigger function to run ArXiv scan (for testing)
 */
export async function runArxivScanManually(): Promise<{
  papersProcessed: number;
  projectsUpdated: number;
  errors: string[];
}> {
  const result = {
    papersProcessed: 0,
    projectsUpdated: 0,
    errors: [] as string[],
  };

  try {
    const papers = await fetchArxivMaterialSciencePapers(10);

    for (const paper of papers) {
      const existing = await dbArxivPapers.findOne({ arxivId: paper.arxivId });
      if (existing) continue;

      const relevantMaterials = extractMaterialsFromAbstract(paper.abstract);
      if (relevantMaterials.length === 0) continue;

      await dbArxivPapers.insertOne({
        arxivId: paper.arxivId,
        title: paper.title,
        abstract: paper.abstract,
        authors: paper.authors,
        publishedDate: paper.publishedDate,
        categories: paper.categories,
        relevantMaterials,
        processedAt: new Date(),
      });

      result.papersProcessed++;

      const activeProjects = await dbRemixProjects.fetch({ status: 'remixed' });

      for (const project of activeProjects) {
        try {
          const { isRelevant, feasibilityChange } = await checkPaperRelevance(
            { title: paper.title, abstract: paper.abstract, relevantMaterials },
            { title: project.title, modernizations: project.modernizations }
          );

          if (isRelevant) {
            const newMaterialUpdates = [
              ...project.materialUpdates,
              {
                date: new Date(),
                paperTitle: paper.title,
                paperUrl: `https://arxiv.org/abs/${paper.arxivId}`,
                relevantMaterial: relevantMaterials.join(', '),
                feasibilityChange,
              },
            ];

            await dbRemixProjects.updateOne(
              { _id: project._id },
              { $set: { materialUpdates: newMaterialUpdates, updatedAt: new Date() } }
            );

            result.projectsUpdated++;
          }
        } catch (e) {
          result.errors.push(`Project ${project._id}: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error');
  }

  return result;
}
