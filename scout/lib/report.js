/**
 * Stage 10/11 — REPORT.
 *
 * Produces the human-first Markdown report and a full JSON dump. Per spec
 * correction #3/"Zusätzliche Regel": an empty social-priorities list is
 * never padded — it prints "None strong enough today." plainly.
 */

function fmtLeague(league) {
  return league.toUpperCase();
}

function priorityLine(cand) {
  return `${cand.priority} · ${fmtLeague(cand.league)} · ${cand.status.toUpperCase()}` +
    (cand.statusConfidence != null ? ` (confidence ${cand.statusConfidence})` : '');
}

function renderPriorityBlock(cand, index) {
  const hasCluster = cand.supportingSources && cand.supportingSources.length;
  const lines = [
    `${index + 1}. ${cand.headline.toUpperCase()}`,
    ...(hasCluster ? [`   PRIMARY STORY · Cluster size: ${cand.clusterSize} · Supporting sources: ${cand.supportingSources.length}`] : []),
    `   ${priorityLine(cand)}`,
    `   Website: ${cand.websiteRelevanceScore}`,
    `   Social: ${cand.socialRelevanceScore}`,
    `   Action: ${cand.action}`,
    `   Format: ${cand.contentType}`,
    `   Video Source: ${cand.videoSourceFound ? `${cand.videoSourceType} — ${cand.videoSourceUrl}` : 'none found'}`,
    `   Why: ${cand.whyFastBreak}`,
    `   Hook: ${cand.hookSuggestion}`
  ];
  if (hasCluster) {
    lines.push('   Also covered by:');
    cand.supportingSources.forEach(s => lines.push(`     - ${s.outlet}: "${s.headline}"`));
  }
  return lines.join('\n');
}

function renderCandidateLine(cand) {
  const clusterNote = (cand.supportingSources && cand.supportingSources.length)
    ? ` · Cluster size: ${cand.clusterSize} (primary + ${cand.supportingSources.length} supporting)`
    : '';
  return `- ${cand.headline} — ${cand.priority} · ${fmtLeague(cand.league)} · Website ${cand.websiteRelevanceScore} / Social ${cand.socialRelevanceScore} · ${cand.action}${clusterNote}`;
}

function renderRejectedLine(cand) {
  return `- "${cand.headline}" — ${cand.rejectionReason || 'below threshold'}`;
}

function buildMarkdownReport({ dateLabel, counts, funnel, sourceFailures }) {
  const lines = [];
  lines.push('FAST BREAK — MORNING SCOUT');
  lines.push(
    `${dateLabel} · ${counts.raw} raw candidates → ${counts.deduped} deduped/checked → ` +
    `${counts.website} website → ${counts.social} social`
  );
  lines.push('');

  lines.push('TOP PRIORITIES');
  lines.push('');
  if (!funnel.socialPriorities.length) {
    lines.push('None strong enough today.');
  } else {
    funnel.socialPriorities.forEach((cand, i) => {
      lines.push(renderPriorityBlock(cand, i));
      lines.push('');
    });
  }
  lines.push('');

  lines.push(`SOCIAL CANDIDATES (${funnel.socialCandidates.length})`);
  lines.push('');
  const promotedIds = new Set(funnel.socialPriorities.map(c => c.candidateId));
  const remainingSocial = funnel.socialCandidates.filter(c => !promotedIds.has(c.candidateId));
  if (!remainingSocial.length) {
    lines.push('(none beyond the Top Priorities above)');
  } else {
    remainingSocial.forEach(c => lines.push(renderCandidateLine(c)));
  }
  lines.push('');

  lines.push(`WEBSITE ONLY (${funnel.websiteOnly.length})`);
  lines.push('');
  if (!funnel.websiteOnly.length) {
    lines.push('(none)');
  } else {
    funnel.websiteOnly.forEach(c => lines.push(renderCandidateLine(c)));
  }
  lines.push('');

  lines.push(`IGNORE / REJECTED (${funnel.rejected.length})`);
  lines.push('');
  if (!funnel.rejected.length) {
    lines.push('(none)');
  } else {
    funnel.rejected.forEach(c => lines.push(renderRejectedLine(c)));
  }
  lines.push('');

  if (sourceFailures.length) {
    lines.push('SOURCE FAILURES THIS RUN');
    lines.push('');
    sourceFailures.forEach(f => lines.push(`- ${f.feed.outlet} (${f.feed.id}): ${f.error}`));
    lines.push('');
  }

  return lines.join('\n');
}

module.exports = { buildMarkdownReport };
