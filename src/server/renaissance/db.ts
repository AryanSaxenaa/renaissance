import { Store, schema } from 'modelence/server';

// Store for patents discovered from searches
export const dbPatents = new Store('patents', {
  schema: {
    patentId: schema.string(),
    title: schema.string(),
    abstract: schema.string(),
    filingDate: schema.date(),
    expiryYear: schema.number(),
    isExpired: schema.boolean(),
    division: schema.string(),
    inventors: schema.array(schema.string()),
    claims: schema.array(schema.string()),
    createdAt: schema.date(),
  },
  indexes: [
    { key: { patentId: 1 }, unique: true },
    { key: { isExpired: 1 } },
    { key: { expiryYear: 1 } },
  ],
});

// Store for remix projects created by users
export const dbRemixProjects = new Store('remixProjects', {
  schema: {
    userId: schema.userId(),
    title: schema.string(),
    description: schema.string(),
    sourcePatentId: schema.string(),
    sourcePatentTitle: schema.string(),
    status: schema.string(), // 'draft' | 'analyzing' | 'remixed' | 'archived'
    blueprintSvg: schema.string(),
    blueprintImageBase64: schema.string(), // AI-generated blueprint image
    modernizations: schema.array(schema.object({
      aspect: schema.string(),
      original: schema.string(),
      modernized: schema.string(),
      material: schema.string(),
      technicalDetail: schema.string(),
    })),
    properties: schema.object({
      torque: schema.string(),
      stress: schema.string(),
      material: schema.string(),
      expiryYear: schema.number(),
    }),
    thoughtLog: schema.array(schema.object({
      timestamp: schema.date(),
      message: schema.string(),
      type: schema.string(), // 'info' | 'success' | 'error' | 'warning'
    })),
    materialUpdates: schema.array(schema.object({
      date: schema.date(),
      paperTitle: schema.string(),
      paperUrl: schema.string(),
      relevantMaterial: schema.string(),
      feasibilityChange: schema.string(),
    })),
    createdAt: schema.date(),
    updatedAt: schema.date(),
  },
  indexes: [
    { key: { userId: 1 } },
    { key: { status: 1 } },
    { key: { createdAt: -1 } },
  ],
});

// Store for search history
export const dbSearchHistory = new Store('searchHistory', {
  schema: {
    userId: schema.userId(),
    query: schema.string(),
    resultsCount: schema.number(),
    createdAt: schema.date(),
  },
  indexes: [
    { key: { userId: 1 } },
    { key: { createdAt: -1 } },
  ],
});

// Store for ArXiv paper cache (for cron job)
export const dbArxivPapers = new Store('arxivPapers', {
  schema: {
    arxivId: schema.string(),
    title: schema.string(),
    abstract: schema.string(),
    authors: schema.array(schema.string()),
    publishedDate: schema.date(),
    categories: schema.array(schema.string()),
    relevantMaterials: schema.array(schema.string()),
    processedAt: schema.date(),
  },
  indexes: [
    { key: { arxivId: 1 }, unique: true },
    { key: { publishedDate: -1 } },
  ],
});
