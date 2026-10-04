import type { DesignBrief, StatusReport } from '../../shared/types.js';

export function renderStatusLine(report: StatusReport): string {
  const conf = report.confidence ? ` (confidence: ${report.confidence})` : '';
  switch (report.headline) {
    case 'LIKELY_FREE':
      return `Appears free to use in ${report.ownOffice}${conf}. No active family member found in the records retrieved.`;
    case 'IN_FORCE':
      return `Patent appears in force in ${report.ownOffice}${conf}.`;
    case 'RELATED_ACTIVE':
      return `Related active or pending family member in ${report.ownOffice}${conf}.`;
    case 'LAPSED_EARLY':
      return `Appears lapsed before estimated term end in ${report.ownOffice}${conf}; verify restoration rules.`;
    case 'UNCERTAIN':
      return `Status uncertain for ${report.ownOffice}${conf}; review legal events and family members.`;
    case 'NOT_ENOUGH_DATA':
      return `Not enough data to assess status for ${report.ownOffice}.`;
    default:
      return `Status: ${report.headline}`;
  }
}

export function renderBriefMarkdown(brief: DesignBrief): string {
  const lines: string[] = ['# Design brief', '', `**Status:** ${brief.statusLine}`, ''];
  const section = (title: string, claims: { text: string; factIds: string[] }[]) => {
    lines.push(`## ${title}`);
    for (const c of claims) {
      lines.push(`- ${c.text} ${c.factIds.map((id) => `[${id}]`).join(' ')}`);
    }
    lines.push('');
  };
  section('Summary', brief.summary);
  section('Mechanism', brief.mechanism);
  section('Market reality', brief.marketReality);
  section('Risks', brief.risks);
  if (brief.suggestions.length) {
    lines.push('## Unverified suggestions');
    for (const s of brief.suggestions) {
      lines.push(`- **${s.title}** (${s.component}): ${s.direction}`);
    }
    lines.push('');
  }
  if (brief.nextSteps.length) {
    lines.push('## Next steps');
    for (const step of brief.nextSteps) lines.push(`- ${step}`);
  }
  lines.push('', `_Claims removed by verifier: ${brief.removedByVerifier}_`);
  return lines.join('\n');
}
