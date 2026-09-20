import React from 'react';
import {
  X,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Activity,
  Calendar
} from 'lucide-react';
import { SiteHealthAssessment, DelayAlert, Site } from '../types';

interface DelayAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site;
  health: SiteHealthAssessment;
  onNavigateToView?: (view: 'statutory' | 'snags' | 'boq' | 'docs') => void;
}

export const DelayAlertsModal: React.FC<DelayAlertsModalProps> = ({
  isOpen,
  onClose,
  site,
  health,
  onNavigateToView
}) => {
  if (!isOpen) return null;

  const getStatusBanner = () => {
    switch (health.status) {
      case 'delayed':
        return {
          bg: 'bg-red-50 border-red-300 text-red-950',
          badge: 'bg-red-100 text-red-800 border-red-300',
          title: 'Commissioning Timeline At Critical Risk'
        };
      case 'minor-risk':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-950',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          title: 'Minor Milestone Deficiencies Detected'
        };
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          title: 'Project On-Track for Target Commissioning'
        };
    }
  };

  const banner = getStatusBanner();
  const displayScore = health.healthScore ?? health.score ?? 0;
  const breakdown = health.breakdown || {
    boqPct: health.boqProgress || 0,
    docCompliancePct: health.docsProgress || 0,
    statutoryPct: health.statutoryProgress || 0,
    snagsIntegrityPct: 100 - (health.criticalSnagsCount * 30 + health.openSnagsCount * 5)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[var(--paper)] rounded-2xl border border-[var(--steel-line)] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--steel-line)] bg-[var(--paper-raised)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-amber-400 flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-condensed font-bold text-lg text-[var(--ink)]">
                Site Health &amp; Critical Delay Predictor
              </h3>
              <p className="text-[11px] text-[var(--steel)] font-mono-plex">
                {site.name} • Target Date: {site.targetDate || '2026-11-30'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--steel)] hover:text-[var(--ink)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Executive Health Score Summary Card */}
          <div className={`p-4 rounded-2xl border ${banner.bg} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase font-mono-plex px-2.5 py-0.5 rounded-full border ${banner.badge}`}>
                  {health.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-[var(--steel)] font-mono-plex">
                  Projected Finish: {health.projectedCommissioningDate || site.targetDate || '2026-11-30'}
                </span>
              </div>
              <h4 className="font-condensed font-bold text-base sm:text-lg text-[var(--ink)]">
                {banner.title}
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Algorithmic projection combining actual BOQ item installation velocity, CEIG / DISCOM statutory clearance stages, and open quality punch points.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center shrink-0 bg-white/90 px-4 py-3 rounded-xl border border-black/10">
              <div className="text-right">
                <div className="text-[10px] uppercase font-mono-plex text-slate-500 font-semibold">Health Score</div>
                <div className="font-condensed font-extrabold text-2xl text-[var(--ink)]">
                  {displayScore}/100
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-mono-plex font-bold text-xs ${
                  displayScore >= 75
                    ? 'border-emerald-500 text-emerald-800 bg-emerald-50'
                    : displayScore >= 50
                    ? 'border-amber-500 text-amber-800 bg-amber-50'
                    : 'border-red-500 text-red-800 bg-red-50'
                }`}
              >
                {displayScore}%
              </div>
            </div>
          </div>

          {/* 4-Vector Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 bg-[var(--paper-raised)] rounded-xl border border-[var(--steel-line)]">
              <span className="text-[10px] font-mono-plex uppercase text-[var(--steel)] block">
                BOQ Progress
              </span>
              <strong className="font-mono-plex text-sm text-[var(--ink)] block mt-0.5">
                {breakdown.boqPct}%
              </strong>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-full" style={{ width: `${breakdown.boqPct}%` }} />
              </div>
            </div>

            <div className="p-3 bg-[var(--paper-raised)] rounded-xl border border-[var(--steel-line)]">
              <span className="text-[10px] font-mono-plex uppercase text-[var(--steel)] block">
                Photo Compliance
              </span>
              <strong className="font-mono-plex text-sm text-[var(--ink)] block mt-0.5">
                {breakdown.docCompliancePct}%
              </strong>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-blue-600 h-full" style={{ width: `${breakdown.docCompliancePct}%` }} />
              </div>
            </div>

            <div className="p-3 bg-[var(--paper-raised)] rounded-xl border border-[var(--steel-line)]">
              <span className="text-[10px] font-mono-plex uppercase text-[var(--steel)] block">
                Statutory Clearances
              </span>
              <strong className="font-mono-plex text-sm text-[var(--ink)] block mt-0.5">
                {breakdown.statutoryPct}%
              </strong>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-amber-600 h-full" style={{ width: `${breakdown.statutoryPct}%` }} />
              </div>
            </div>

            <div className="p-3 bg-[var(--paper-raised)] rounded-xl border border-[var(--steel-line)]">
              <span className="text-[10px] font-mono-plex uppercase text-[var(--steel)] block">
                Punch Point Integrity
              </span>
              <strong className="font-mono-plex text-sm text-[var(--ink)] block mt-0.5">
                {breakdown.snagsIntegrityPct}%
              </strong>
              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-full" style={{ width: `${breakdown.snagsIntegrityPct}%` }} />
              </div>
            </div>
          </div>

          {/* Active Alerts & Remediation Actions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-condensed font-bold text-base text-[var(--ink)] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Critical Milestones &amp; Bottlenecks ({health.alerts.length})</span>
              </h5>
              <span className="text-[11px] font-mono-plex text-[var(--steel)]">
                Sorted by risk severity
              </span>
            </div>

            {health.alerts.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-[var(--steel-line)] rounded-xl bg-white space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <div className="font-semibold text-xs text-[var(--ink)]">Zero Bottlenecks Detected</div>
                <div className="text-[11px] text-[var(--steel)]">All statutory and field construction workflows are proceeding within schedule limits.</div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {health.alerts.map((alert, idx) => {
                  const isCritical = alert.severity === 'critical';
                  const isMajor = alert.severity === 'major';

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isCritical
                          ? 'bg-red-50/70 border-red-300'
                          : isMajor
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-blue-50/70 border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            {isCritical ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                                <Flame className="w-3 h-3 text-red-600" />
                                <span>CRITICAL BLOCKER</span>
                              </span>
                            ) : isMajor ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>MAJOR DELAY RISK</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                <span>RECOMMENDATION</span>
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed">{alert.details}</p>

                          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold pt-1">
                            <span className="text-[11px] font-mono-plex text-slate-500 uppercase">Remedial Action:</span>
                            <span>{alert.suggestedAction}</span>
                          </div>
                        </div>

                        {alert.relatedView && onNavigateToView && (
                          <button
                            onClick={() => {
                              onNavigateToView(alert.relatedView as any);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 hover:border-slate-900 transition-colors shadow-2xs shrink-0 cursor-pointer"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[var(--steel-line)] bg-[var(--paper-raised)] flex items-center justify-between">
          <div className="text-[11px] text-[var(--steel)] font-mono-plex">
            Calculated against CEA &amp; DISCOM 2026 Turnkey Regulations
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[var(--ink)] text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
