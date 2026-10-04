export type LegalCategory = 'ACTIVE' | 'NON_ACTIVE' | 'PENDING' | 'UNKNOWN';

export type ParentApplication = {
  application_number?: string;
  filing_date?: string;
};

export type WorldwideApplication = {
  country_code?: string;
  application_number?: string;
  filing_date?: string;
  legal_status?: string;
  legal_status_cat?: string;
  this_app?: boolean;
};

export type LegalEvent = {
  code?: string;
  title?: string;
  date?: string;
};

export type PatentDetails = {
  patent_id: string;
  title?: string;
  abstract?: string;
  claims?: string[];
  filing_date?: string;
  publication_date?: string;
  worldwide_applications?: WorldwideApplication[];
  parent_applications?: ParentApplication[];
  legal_events?: LegalEvent[];
  synthetic?: boolean;
};

export type PatentSearchHit = {
  patent_id: string;
  title: string;
  publication_date?: string;
  filing_date?: string;
  inventor?: string;
  assignee?: string;
  country_status?: Record<string, string>;
  snippet?: string;
};
