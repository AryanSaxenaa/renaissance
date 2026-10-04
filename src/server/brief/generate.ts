import type { Fact } from '../../shared/types.js';
import { getConfig } from '../config.js';
import { chatJson } from '../llm/client.js';
import { generatorSystemPrompt, generatorUserPrompt } from './prompts.js';
import { buildReplayDraftFromFacts } from './replayDraft.js';
import { designBriefGeneratorSchema } from './schema.js';
import type { DesignBriefGeneratorOutput } from './schema.js';

export async function generateBriefDraft(query: string, facts: Fact[]): Promise<DesignBriefGeneratorOutput> {
  try {
    return await chatJson({
      promptId: 'design_brief_generator/1',
      system: generatorSystemPrompt(),
      user: generatorUserPrompt(query, facts),
      schema: designBriefGeneratorSchema,
    });
  } catch (err) {
    const config = getConfig();
    if (config.mode === 'replay' || !config.OPENROUTER_API_KEY) {
      return buildReplayDraftFromFacts(facts);
    }
    throw err;
  }
}
