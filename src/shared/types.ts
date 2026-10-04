export type FactKind = 'status' | 'patent_text' | 'market' | 'maker' | 'paper' | 'news';

export type FactSource = {
  callId: string;
  engine: string;
  searchMetadataId: string | null;
  path: string;
};

export type Fact = {
  id: string;
  key: string;
  kind: FactKind;
  text: string;
  value?: number | string;
  unit?: string;
  source: FactSource;
};

export type BriefClaim = {
  text: string;
  factIds: string[];
};

export type Suggestion = {
  title: string;
  component: string;
  direction: string;
  kind: 'suggestion';
  assumptions: string[];
  factIds: string[];
  engineeringJudgement: boolean;
};

export type DesignBrief = {
  schema: 'design_brief/1';
  summary: BriefClaim[];
  mechanism: BriefClaim[];
  marketReality: BriefClaim[];
  suggestions: Suggestion[];
  risks: BriefClaim[];
  nextSteps: string[];
  statusLine: string;
  removedByVerifier: number;
};

export type Verdict =
  | 'IN_FORCE'
  | 'LIKELY_FREE'
  | 'LAPSED_EARLY'
  | 'RELATED_ACTIVE'
  | 'UNCERTAIN'
  | 'NOT_ENOUGH_DATA';

export type Confidence = 'HIGH' | 'MEDIUM' | 'LOW' | null;

export type StatusMember = {
  office: string;
  appNo: string;
  cat: 'ACTIVE' | 'NON_ACTIVE' | 'PENDING' | 'UNKNOWN';
  raw: string;
  thisApp: boolean;
};

export type StatusEvent = {
  code: string;
  title: string;
  date: string;
  recognised: boolean;
};

export type TermEstimate = {
  earliestFiling: string;
  endEstimate: string;
  elapsed: boolean;
  caveat: string;
};

export type StatusEvidence = {
  callId: string;
  searchMetadataId: string;
  path: string;
};

export type StatusReport = {
  ownOffice: string;
  headline: Verdict;
  confidence: Confidence;
  termEstimate: TermEstimate;
  members: StatusMember[];
  events: StatusEvent[];
  otherOffices: Record<string, Verdict>;
  rulesFired: string[];
  unrecognised: string[];
  notChecked: string[];
  evidence: StatusEvidence[];
};

export type ScanProgress = {
  phase: string;
  done: boolean;
  message?: string;
};

export type ScanRecord = {
  id: string;
  projectId: string;
  kind: 'initial' | 'rescan';
  mode: 'live' | 'replay';
  status: 'pending' | 'running' | 'complete' | 'failed';
  progress: ScanProgress[];
  statusReport?: StatusReport;
  facts: Fact[];
  brief?: DesignBrief;
  removedByVerifier: number;
  credits: number;
  createdAt: string;
};
