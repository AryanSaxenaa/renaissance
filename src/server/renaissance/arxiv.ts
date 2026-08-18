/**
 * ArXiv API Integration
 * Real integration with the arXiv.org API for fetching material science papers
 */

interface ArxivPaper {
  arxivId: string;
  title: string;
  abstract: string;
  authors: string[];
  publishedDate: Date;
  categories: string[];
  pdfUrl: string;
}


/**
 * Parse ArXiv XML response to extract paper data
 */
function parseArxivXml(xmlText: string): ArxivPaper[] {
  const papers: ArxivPaper[] = [];

  // Extract entries using regex (simpler than full XML parser)
  const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xmlText)) !== null) {
    const entryXml = match[1];

    // Extract ID
    const idMatch = /<id[^>]*>([^<]+)<\/id>/i.exec(entryXml);
    const arxivId = idMatch ? idMatch[1].replace('http://arxiv.org/abs/', '') : '';

    // Extract title
    const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(entryXml);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';

    // Extract summary/abstract
    const summaryMatch = /<summary[^>]*>([\s\S]*?)<\/summary>/i.exec(entryXml);
    const abstract = summaryMatch ? summaryMatch[1].replace(/\s+/g, ' ').trim() : '';

    // Extract authors
    const authors: string[] = [];
    const authorRegex = /<author[^>]*>[\s\S]*?<name[^>]*>([^<]+)<\/name>[\s\S]*?<\/author>/gi;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(entryXml)) !== null) {
      authors.push(authorMatch[1].trim());
    }

    // Extract published date
    const publishedMatch = /<published[^>]*>([^<]+)<\/published>/i.exec(entryXml);
    const publishedDate = publishedMatch ? new Date(publishedMatch[1]) : new Date();

    // Extract categories
    const categories: string[] = [];
    const categoryRegex = /<category[^>]*term="([^"]+)"/gi;
    let categoryMatch;
    while ((categoryMatch = categoryRegex.exec(entryXml)) !== null) {
      categories.push(categoryMatch[1]);
    }

    // Extract PDF URL
    const pdfMatch = /<link[^>]*title="pdf"[^>]*href="([^"]+)"/i.exec(entryXml) ||
                     /<link[^>]*href="([^"]+)"[^>]*title="pdf"/i.exec(entryXml);
    const pdfUrl = pdfMatch ? pdfMatch[1] : `http://arxiv.org/pdf/${arxivId}`;

    if (arxivId && title) {
      papers.push({
        arxivId,
        title,
        abstract,
        authors,
        publishedDate,
        categories,
        pdfUrl,
      });
    }
  }

  return papers;
}

/**
 * Fetch material science papers from ArXiv API
 * Categories: cond-mat.mtrl-sci (Materials Science)
 */
export async function fetchArxivMaterialSciencePapers(maxResults: number = 10): Promise<ArxivPaper[]> {
  // Search for recent material science papers
  // Categories:
  // - cond-mat.mtrl-sci: Materials Science
  // - physics.app-ph: Applied Physics
  // Search terms related to materials that could modernize old patents
  const searchTerms = [
    'carbon nanotube',
    'graphene',
    'titanium alloy',
    'composite material',
    'additive manufacturing',
    '3D printing metal',
    'self-healing material',
    'nanomaterial',
    'ceramic composite',
    'polymer composite',
  ];

  // Pick a random search term to vary results
  const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

  const baseUrl = 'http://export.arxiv.org/api/query';
  const params = new URLSearchParams({
    search_query: `all:${searchTerm} AND (cat:cond-mat.mtrl-sci OR cat:physics.app-ph)`,
    start: '0',
    max_results: maxResults.toString(),
    sortBy: 'submittedDate',
    sortOrder: 'descending',
  });

  const url = `${baseUrl}?${params.toString()}`;

  console.log(`[ArXiv API] Fetching papers with query: ${searchTerm}`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RenaissanceAI/1.0 (Patent Modernization Tool)',
      },
    });

    if (!response.ok) {
      throw new Error(`ArXiv API error: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    const papers = parseArxivXml(xmlText);

    console.log(`[ArXiv API] Successfully fetched ${papers.length} papers`);

    return papers;
  } catch (error) {
    console.error('[ArXiv API] Error fetching papers:', error);
    throw error;
  }
}

/**
 * Search ArXiv for papers matching specific keywords
 */
export async function searchArxivPapers(query: string, maxResults: number = 5): Promise<ArxivPaper[]> {
  const baseUrl = 'http://export.arxiv.org/api/query';
  const params = new URLSearchParams({
    search_query: `all:${query}`,
    start: '0',
    max_results: maxResults.toString(),
    sortBy: 'relevance',
    sortOrder: 'descending',
  });

  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RenaissanceAI/1.0 (Patent Modernization Tool)',
      },
    });

    if (!response.ok) {
      throw new Error(`ArXiv API error: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    return parseArxivXml(xmlText);
  } catch (error) {
    console.error('[ArXiv API] Error searching papers:', error);
    throw error;
  }
}

/**
 * Extract relevant materials mentioned in paper abstract
 */
export function extractMaterialsFromAbstract(abstract: string): string[] {
  const materialKeywords = [
    'carbon nanotube', 'carbon nanotubes', 'CNT', 'SWCNT', 'MWCNT',
    'graphene', 'graphene oxide', 'GO', 'rGO',
    'titanium', 'Ti-6Al-4V', 'titanium alloy',
    'aluminum', 'aluminium', 'Al alloy',
    'steel', 'stainless steel', 'high-strength steel',
    'polymer', 'thermoplastic', 'thermoset', 'epoxy', 'PEEK', 'PTFE',
    'ceramic', 'silicon carbide', 'SiC', 'alumina', 'Al2O3', 'zirconia',
    'composite', 'CFRP', 'GFRP', 'MMC', 'CMC',
    'alloy', 'superalloy', 'nickel alloy', 'cobalt alloy',
    'nanomaterial', 'nanoparticle', 'nanofiber', 'nanocomposite',
    'carbon fiber', 'kevlar', 'aramid',
    'tungsten', 'tungsten carbide', 'WC',
    'magnesium', 'Mg alloy',
    'copper', 'Cu alloy', 'bronze', 'brass',
    'additive manufacturing', '3D printing', 'SLM', 'SLS', 'DMLS',
    'self-healing', 'shape memory', 'SMA',
    'aerogel', 'foam', 'lattice structure',
  ];

  const foundMaterials: string[] = [];
  const lowerAbstract = abstract.toLowerCase();

  for (const keyword of materialKeywords) {
    if (lowerAbstract.includes(keyword.toLowerCase())) {
      // Avoid duplicates and prefer longer, more specific terms
      const existing = foundMaterials.find(m =>
        m.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(m.toLowerCase())
      );
      if (!existing) {
        foundMaterials.push(keyword);
      } else if (keyword.length > existing.length) {
        // Replace with more specific term
        const index = foundMaterials.indexOf(existing);
        foundMaterials[index] = keyword;
      }
    }
  }

  return foundMaterials.slice(0, 5); // Limit to top 5 materials
}
