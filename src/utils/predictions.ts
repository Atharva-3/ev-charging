import { Site, BoqCategory, SiteTrackerState, SiteSnag, SiteStatutoryRecord, SiteHealthAssessment, DelayAlert } from '../types';
import { getBoqStats, getDocStats } from './formatters';

export function calculateSiteHealth(
  site: Site,
  categories: BoqCategory[],
  state?: SiteTrackerState,
  statutory?: SiteStatutoryRecord,
  snags?: SiteSnag[]
): SiteHealthAssessment {
  const boqStats = getBoqStats(categories, state);
  const docStats = getDocStats(state);

  // Calculate days remaining
  let daysRemaining = 30; // default assumption
  if (site.targetDate) {
    const target = new Date(site.targetDate).getTime();
    const today = new Date().getTime();
    daysRemaining = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }

  // Statutory progress calculation
  const totalStatutoryStages = 6;
  let approvedStatutoryStages = 0;
  if (statutory?.stages) {
    Object.values(statutory.stages).forEach((stage) => {
      if (stage.status === 'approved') {
        approvedStatutoryStages++;
      }
    });
  }
  const statutoryProgress = Math.round((approvedStatutoryStages / totalStatutoryStages) * 100);

  // Snag counts
  const siteSnags = (snags || []).filter((s) => s.siteId === site.id);
  const openSnags = siteSnags.filter((s) => s.status !== 'resolved');
  const criticalSnags = openSnags.filter((s) => s.severity === 'critical');
  const majorSnags = openSnags.filter((s) => s.severity === 'major');

  const alerts: DelayAlert[] = [];

  // Rule 1: Critical Snag Blockers
  if (criticalSnags.length > 0) {
    alerts.push({
      id: 'snag-critical',
      level: 'critical',
      severity: 'critical',
      category: 'Quality & Safety',
      title: `${criticalSnags.length} Critical Snag(s) Pending Resolution`,
      message: `Energization is blocked until critical defects (e.g. ${criticalSnags[0].title}) are resolved and photo verified.`,
      details: `Energization is blocked until critical defects (${criticalSnags[0].title}) are rectified and photo verified on-site.`,
      impactDays: 5,
      recommendation: 'Direct assigned field engineer to rectify safety defects immediately.',
      suggestedAction: 'Direct assigned field engineer to rectify safety defects and verify with watermarked photo.',
      relatedView: 'snags'
    });
  }

  // Rule 2: CEIG Statutory Approval Timeline Lead Time
  const ceigSafetyStage = statutory?.stages?.ceig_safety_clearance?.status;
  const ceigAppStage = statutory?.stages?.ceig_inspection_application?.status;

  if (ceigSafetyStage !== 'approved') {
    if (daysRemaining <= 14 && ceigAppStage !== 'submitted' && ceigAppStage !== 'approved') {
      alerts.push({
        id: 'ceig-lead-time',
        level: 'critical',
        severity: 'critical',
        category: 'Statutory Clearance',
        title: 'CEIG Inspection Lead Time Exceeded',
        message: 'CEIG application has not been submitted with less than 14 days remaining. Typical electrical inspectorate processing requires 10–15 days.',
        details: 'CEIG application has not been submitted with less than 14 days remaining. Typical electrical inspectorate processing requires 10–15 days.',
        impactDays: 12,
        recommendation: 'Submit transformer test certificate, drawing set, and single-line diagram (SLD) to CEIG portal today.',
        suggestedAction: 'Submit transformer test certificate, drawing set, and single-line diagram (SLD) to CEIG portal today.',
        relatedView: 'statutory'
      });
    } else if (daysRemaining <= 21 && ceigAppStage === 'query-raised') {
      alerts.push({
        id: 'ceig-query',
        level: 'warning',
        severity: 'major',
        category: 'Statutory Clearance',
        title: 'CEIG Official Query Outstanding',
        message: 'Inspectorate has raised observations on drawings or earthing calculations.',
        details: 'Inspectorate has raised observations on drawings or earthing calculations.',
        impactDays: 7,
        recommendation: 'Submit clarification letter with updated earthing test values.',
        suggestedAction: 'Submit clarification letter with updated earthing test values.',
        relatedView: 'statutory'
      });
    }
  }

  // Rule 3: Civil Works bottleneck vs Target Date
  const civilCat = categories.find((c) => c.num === 1 || c.name.toLowerCase().includes('civil'));
  if (civilCat) {
    const civilItems = civilCat.items;
    let installedCivil = 0;
    civilItems.forEach((item) => {
      const s = state?.boq?.[`${civilCat.num}::${item.sr}`]?.status;
      if (s === 'installed' || s === 'verified') installedCivil++;
    });
    const civilPct = Math.round((installedCivil / (civilItems.length || 1)) * 100);

    if (civilPct < 70 && daysRemaining <= 10) {
      alerts.push({
        id: 'civil-delay',
        level: 'critical',
        severity: 'critical',
        category: 'Civil Works',
        title: 'Transformer & EVSE Plinth Foundation Incomplete',
        message: `Civil foundations are only ${civilPct}% complete. Plinth curing requires minimum 7 days before transformer placement.`,
        details: `Civil foundations are only ${civilPct}% complete. Plinth curing requires minimum 7 days before transformer placement.`,
        impactDays: 8,
        recommendation: 'Accelerate concrete pouring and use fast-curing admixes if approved.',
        suggestedAction: 'Accelerate concrete pouring and use fast-curing admixes if approved.',
        relatedView: 'boq'
      });
    }
  }

  // Rule 4: Schedule vs Progress Variance
  const overallProgress = Math.round(
    boqStats.pct * 0.45 + docStats.pct * 0.25 + statutoryProgress * 0.3
  );

  if (daysRemaining <= 5 && overallProgress < 85) {
    alerts.push({
      id: 'overall-schedule-slip',
      level: 'critical',
      severity: 'critical',
      category: 'Overall Project Schedule',
      title: 'Severe Commissioning Deadline Slippage Risk',
      message: `Only ${daysRemaining} day(s) left until target date (${site.targetDate || 'TBD'}) with overall progress at ${overallProgress}%.`,
      details: `Only ${daysRemaining} day(s) left until target date (${site.targetDate || 'TBD'}) with overall progress at ${overallProgress}%.`,
      impactDays: Math.max(10, 20 - daysRemaining),
      recommendation: 'Hold emergency review with DISCOM and contractor leads to reschedule energization window.',
      suggestedAction: 'Hold emergency review with DISCOM and contractor leads to reschedule energization window.',
      relatedView: 'statutory'
    });
  } else if (daysRemaining <= 15 && overallProgress < 50) {
    alerts.push({
      id: 'pace-warning',
      level: 'warning',
      severity: 'major',
      category: 'Pace of Execution',
      title: 'Execution Velocity Lagging Milestone Plan',
      message: `Site is at ${overallProgress}% progress with only 2 weeks remaining before targeted handover.`,
      details: `Site is at ${overallProgress}% progress with only 2 weeks remaining before targeted handover.`,
      impactDays: 6,
      recommendation: 'Deploy additional electrical cable-pulling gang to parallelize works.',
      suggestedAction: 'Deploy additional electrical cable-pulling gang to parallelize works.',
      relatedView: 'boq'
    });
  }

  // Determine overall status and score
  let status: 'on-track' | 'minor-risk' | 'delayed' = 'on-track';
  if (criticalSnags.length > 0 || alerts.some((a) => a.level === 'critical')) {
    status = 'delayed';
  } else if (majorSnags.length > 0 || alerts.some((a) => a.level === 'warning')) {
    status = 'minor-risk';
  }

  // Score computation 0-100
  let score = overallProgress;
  if (status === 'delayed') score = Math.max(25, score - 25);
  else if (status === 'minor-risk') score = Math.max(50, score - 12);

  const snagsIntegrity = Math.max(0, 100 - (criticalSnags.length * 35 + majorSnags.length * 15 + (openSnags.length - criticalSnags.length - majorSnags.length) * 5));

  // Projected date calculation
  const targetDateObj = site.targetDate ? new Date(site.targetDate) : new Date(Date.now() + 30 * 86400000);
  const totalDelayDays = alerts.reduce((max, a) => Math.max(max, a.impactDays || 0), 0);
  const projectedTime = new Date(targetDateObj.getTime() + totalDelayDays * 86400000);
  const projectedCommissioningDate = projectedTime.toISOString().split('T')[0];

  return {
    status,
    score,
    healthScore: score,
    daysRemaining,
    projectedCommissioningDate,
    boqProgress: boqStats.pct,
    docsProgress: docStats.pct,
    statutoryProgress,
    openSnagsCount: openSnags.length,
    criticalSnagsCount: criticalSnags.length,
    breakdown: {
      boqPct: boqStats.pct,
      docCompliancePct: docStats.pct,
      statutoryPct: statutoryProgress,
      snagsIntegrityPct: Math.round(snagsIntegrity)
    },
    alerts
  };
}
