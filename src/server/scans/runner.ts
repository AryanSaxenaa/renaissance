import { getConfig } from '../config.js';
import { assembleFacts } from '../brief/facts.js';
import { generateBriefDraft } from '../brief/generate.js';
import { renderStatusLine } from '../brief/render.js';
import { verifyBrief } from '../brief/verify.js';
import { fetchMaps, isAllowedCity } from '../market/maps.js';
import { fetchShopping } from '../market/shopping.js';
import { fetchScholar } from '../literature/scholar.js';
import { fetchNews } from '../news/news.js';
import { computeStatusReport } from '../patents/status.js';
import { fetchPatentDetails } from '../patents/details.js';
import { SerpClient } from '../serpapi/client.js';
import { getStore } from '../store/index.js';
import { logger } from '../logger.js';

export async function runDossierScan(input: {
  scanId: string;
  projectId: string;
  patentId: string;
  query: string;
  city: string;
  noCache?: boolean;
}): Promise<void> {
  const store = await getStore();
  const config = getConfig();
  const client = new SerpClient();
  client.budget.resetBrief();

  await store.updateScan(input.scanId, { status: 'running' });

  try {
    if (!isAllowedCity(input.city)) {
      throw new Error('city_not_allowed');
    }

    const detailsResult = await fetchPatentDetails(
      client,
      input.patentId,
      { scanId: input.scanId },
      { noCache: input.noCache },
    );

    const detailsSource = {
      callId: detailsResult.callId,
      engine: 'google_patents_details',
      searchMetadataId: detailsResult.searchMetadataId,
      path: 'patent_details',
    };

    const statusReport = computeStatusReport({
      details: detailsResult.details,
      evidence: [
        {
          callId: detailsResult.callId,
          searchMetadataId: detailsResult.searchMetadataId ?? '',
          path: 'patent_details',
        },
      ],
    });

    const [shopping, maps, scholar, news] = await Promise.all([
      fetchShopping(client, input.query, { scanId: input.scanId, patentId: input.patentId }),
      fetchMaps(client, input.query, input.city, { scanId: input.scanId, patentId: input.patentId }),
      fetchScholar(client, input.query, { scanId: input.scanId, patentId: input.patentId }),
      fetchNews(client, input.query, { scanId: input.scanId, patentId: input.patentId }),
    ]);

    const facts = assembleFacts({
      statusReport,
      details: detailsResult.details,
      detailsSource,
      market: shopping.facts,
      makers: maps.facts,
      papers: scholar.facts,
      news: news.facts,
    });

    const statusLine = renderStatusLine(statusReport);
    let brief;
    try {
      const draft = await generateBriefDraft(input.query, facts);
      brief = await verifyBrief(draft, facts, statusLine);
    } catch (err) {
      logger.warn({ err: String(err) }, 'brief_generation_skipped');
      brief = {
        schema: 'design_brief/1' as const,
        summary: [],
        mechanism: [],
        marketReality: [],
        suggestions: [],
        risks: [],
        nextSteps: ['Review facts and retry brief generation when LLM fixtures are available'],
        statusLine,
        removedByVerifier: 0,
      };
    }

    const credits = client.ledger.totalCredits(input.scanId);
    for (const receipt of client.ledger.list(input.scanId)) {
      await store.recordSerpCall(receipt);
    }

    await store.updateScan(input.scanId, {
      status: 'complete',
      statusReport,
      facts,
      brief,
      removedByVerifier: brief.removedByVerifier,
      credits,
      mode: config.mode === 'live' ? 'live' : 'replay',
    });
  } catch (err) {
    logger.error({ err: String(err), scanId: input.scanId }, 'scan_failed');
    await store.updateScan(input.scanId, { status: 'failed' });
    throw err;
  }
}
