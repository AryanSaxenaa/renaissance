/**
 * Google Patents API Integration via SerpApi
 * Real integration for fetching expired patents based on search queries
 */

const SERPAPI_BASE_URL = 'https://serpapi.com/search';

// Debug: Log env status on module load (v2)
console.log('[Patents API] Module loaded, checking environment...');
console.log('[Patents API] SERPAPI_API_KEY present:', !!process.env.SERPAPI_API_KEY);
console.log('[Patents API] SERPAPI_API_KEY length:', process.env.SERPAPI_API_KEY?.length || 0);

interface PatentResult {
  patentId: string;
  title: string;
  abstract: string;
  filingDate: Date;
  expiryYear: number;
  isExpired: boolean;
  division: string;
  inventors: string[];
  claims: string[];
  pdfUrl: string;
  thumbnailUrl: string;
}

interface SerpApiPatentResult {
  patent_id?: string;
  title?: string;
  snippet?: string;
  publication_date?: string;
  filing_date?: string;
  inventor?: string;
  assignee?: string;
  pdf?: string;
  thumbnail?: string;
  claims?: string[];
}

interface SerpApiResponse {
  organic_results?: SerpApiPatentResult[];
  error?: string;
}

function getSerpApiKey(): string {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new Error('SERPAPI_API_KEY environment variable is not set. Please add your SerpApi key to .modelence.env');
  }
  return apiKey;
}

/**
 * Determine patent division based on title and abstract keywords
 */
function inferPatentDivision(title: string, abstract: string): string {
  const text = `${title} ${abstract}`.toLowerCase();

  if (text.includes('hydraulic') || text.includes('fluid power') || text.includes('actuator')) {
    return 'HYDRAUL';
  }
  if (text.includes('pump') || text.includes('valve') || text.includes('flow') || text.includes('fluid')) {
    return 'FLUID_DYN';
  }
  if (text.includes('heat') || text.includes('thermal') || text.includes('engine') || text.includes('combustion') || text.includes('steam')) {
    return 'THERMO_ENG';
  }
  if (text.includes('sensor') || text.includes('meter') || text.includes('gauge') || text.includes('instrument') || text.includes('measurement')) {
    return 'INSTRUM';
  }
  // Default to mechanical engineering
  return 'MECH_ENG';
}

/**
 * Calculate if patent is expired (20 years from filing date)
 */
function isPatentExpired(filingDate: Date): boolean {
  const expiryDate = new Date(filingDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 20);
  return new Date() > expiryDate;
}

/**
 * Parse inventors string into array
 */
function parseInventors(inventorString: string | undefined): string[] {
  if (!inventorString) return ['Unknown Inventor'];
  // Remove any brackets, parentheses and trim
  const cleaned = inventorString.replace(/[\[\]\(\)]/g, '');
  return cleaned.split(/[,;]/).map(name => name.trim()).filter(Boolean);
}

/**
 * Clean patent text (remove HTML entities, OCR artifacts)
 */
function cleanPatentText(text: string): string {
  if (!text) return '';

  // Specific OCR artifact cleanup
  let cleaned = text
    .replace(/&lt;SEP&gt;/gi, ' ')
    .replace(/&lt;tb&gt;/gi, ' ')
    .replace(/<SEP>/gi, ' ')
    .replace(/<tb>/gi, ' ');

  // Basic HTML entity decoding
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // Collapse whitespace
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Search Google Patents for expired patents via SerpApi
 */
export async function searchGooglePatents(
  query: string,
  options: {
    maxResults?: number;
    onlyExpired?: boolean;
    beforeYear?: number;
  } = {}
): Promise<PatentResult[]> {
  const { maxResults = 10, onlyExpired = true, beforeYear = 2005 } = options;

  const apiKey = getSerpApiKey();

  // Build search query to find old patents (20+ years)
  // Adding date filter to find patents that are likely expired
  const searchQuery = onlyExpired
    ? `${query} before:${beforeYear}`
    : query;

  const params = new URLSearchParams({
    engine: 'google_patents',
    q: searchQuery,
    api_key: apiKey,
    num: maxResults.toString(),
  });

  const url = `${SERPAPI_BASE_URL}?${params.toString()}`;

  console.log(`[Google Patents API] Searching for: ${searchQuery}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SerpApi error: ${response.status} - ${errorText}`);
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      throw new Error(`SerpApi error: ${data.error}`);
    }

    const results = data.organic_results || [];
    console.log(`[Google Patents API] Found ${results.length} results`);

    const patents: PatentResult[] = [];

    for (const result of results) {
      // Parse filing date
      let filingDate: Date;
      if (result.filing_date) {
        filingDate = new Date(result.filing_date);
      } else if (result.publication_date) {
        // Use publication date as fallback, filing is typically 1-2 years before
        const pubDate = new Date(result.publication_date);
        pubDate.setFullYear(pubDate.getFullYear() - 1);
        filingDate = pubDate;
      } else {
        // Default to very old date for "unknown" patents
        filingDate = new Date('1990-01-01');
      }

      // Check if expired (20+ years old)
      const expired = isPatentExpired(filingDate);

      // Skip if we only want expired patents and this one isn't
      if (onlyExpired && !expired) {
        continue;
      }

      const expiryYear = filingDate.getFullYear() + 20;
      const title = cleanPatentText(result.title || 'Untitled Patent');
      const abstract = cleanPatentText(result.snippet || '');

      patents.push({
        patentId: result.patent_id || `UNKNOWN-${Date.now()}`,
        title,
        abstract,
        filingDate,
        expiryYear,
        isExpired: expired,
        division: inferPatentDivision(title, abstract),
        inventors: parseInventors(result.inventor),
        claims: result.claims || [
          'Claim details available in full patent document',
        ],
        pdfUrl: result.pdf || '',
        thumbnailUrl: result.thumbnail || '',
      });
    }

    console.log(`[Google Patents API] Returning ${patents.length} expired patents`);
    return patents;

  } catch (error) {
    console.error('[Google Patents API] Error:', error);
    throw error;
  }
}

/**
 * Get patent details by ID via SerpApi
 */
export async function getPatentById(patentId: string): Promise<PatentResult | null> {
  const apiKey = getSerpApiKey();

  const params = new URLSearchParams({
    engine: 'google_patents',
    q: patentId,
    api_key: apiKey,
    num: '1',
  });

  const url = `${SERPAPI_BASE_URL}?${params.toString()}`;

  console.log(`[Google Patents API] Fetching patent: ${patentId}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SerpApi error: ${response.status} - ${errorText}`);
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      throw new Error(`SerpApi error: ${data.error}`);
    }

    const results = data.organic_results || [];

    if (results.length === 0) {
      return null;
    }

    const result = results[0];

    let filingDate: Date;
    if (result.filing_date) {
      filingDate = new Date(result.filing_date);
    } else if (result.publication_date) {
      const pubDate = new Date(result.publication_date);
      pubDate.setFullYear(pubDate.getFullYear() - 1);
      filingDate = pubDate;
    } else {
      filingDate = new Date('1990-01-01');
    }

    const expiryYear = filingDate.getFullYear() + 20;
    const title = cleanPatentText(result.title || 'Untitled Patent');
    const abstract = cleanPatentText(result.snippet || '');

    return {
      patentId: result.patent_id || patentId,
      title,
      abstract,
      filingDate,
      expiryYear,
      isExpired: isPatentExpired(filingDate),
      division: inferPatentDivision(title, abstract),
      inventors: parseInventors(result.inventor),
      claims: result.claims || ['Claim details available in full patent document'],
      pdfUrl: result.pdf || '',
      thumbnailUrl: result.thumbnail || '',
    };

  } catch (error) {
    console.error('[Google Patents API] Error fetching patent:', error);
    throw error;
  }
}

/**
 * Search for patents by problem statement using AI-enhanced query
 */
export async function searchPatentsByProblemStatement(
  problemStatement: string,
  maxResults: number = 10
): Promise<PatentResult[]> {
  // Extract key technical terms from the problem statement
  const technicalKeywords = extractTechnicalKeywords(problemStatement);

  // Build a search query combining the problem statement with technical keywords
  const searchQuery = technicalKeywords.length > 0
    ? `${problemStatement} ${technicalKeywords.join(' ')}`
    : problemStatement;

  return searchGooglePatents(searchQuery, { maxResults, onlyExpired: true });
}

/**
 * Extract technical keywords from a problem statement
 */
function extractTechnicalKeywords(text: string): string[] {
  const technicalTerms = [
    'mechanical', 'hydraulic', 'pneumatic', 'electric', 'motor',
    'gear', 'pump', 'valve', 'bearing', 'shaft', 'coupling',
    'sensor', 'actuator', 'control', 'automation',
    'heat', 'thermal', 'cooling', 'heating', 'exchanger',
    'fluid', 'flow', 'pressure', 'vacuum',
    'material', 'alloy', 'composite', 'polymer',
    'manufacturing', 'machining', 'casting', 'forging',
    'assembly', 'mechanism', 'linkage', 'transmission',
    'engine', 'turbine', 'compressor', 'generator',
  ];

  const lowerText = text.toLowerCase();
  return technicalTerms.filter(term => lowerText.includes(term));
}
