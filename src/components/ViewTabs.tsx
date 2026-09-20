import React from 'react';
import { ActiveView, UserRole } from '../types';
import { Camera, CheckSquare, DollarSign, Sliders, MapPin, Zap, AlertTriangle, Award, FileCheck2 } from 'lucide-react';

interface ViewTabsProps {
  activeView: ActiveView;
  userRole?: UserRole;
  openSnagsCount?: number;
  onViewChange: (view: ActiveView) => void;
}

export const ViewTabs: React.FC<ViewTabsProps> = ({
  activeView,
  userRole = 'manager',
  openSnagsCount = 0,
  onViewChange
}) => {
  const isWorker = userRole === 'worker';

  // Worker tabs prioritize photo upload and ground execution
  const tabs: { id: ActiveView; label: string; icon?: React.ReactNode; badge?: number }[] = isWorker
    ? [
        { id: 'docs', label: 'Field Photos & Compliance', icon: <Camera className="w-3.5 h-3.5 text-[var(--rust)]" /> },
        { id: 'boq', label: 'Installation Execution (BOQ)', icon: <CheckSquare className="w-3.5 h-3.5" /> },
        { id: 'snags', label: 'Snags & Punch Points', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />, badge: openSnagsCount },
        { id: 'statutory', label: 'DISCOM & CEIG Status', icon: <Zap className="w-3.5 h-3.5 text-amber-600" /> },
        { id: 'specs', label: 'Field Notes & Specs', icon: <Sliders className="w-3.5 h-3.5" /> },
        { id: 'map', label: 'Site Location', icon: <MapPin className="w-3.5 h-3.5" /> }
      ]
    : [
        { id: 'boq', label: 'BOQ Items' },
        { id: 'docs', label: 'Audit & Watermarked Photos' },
        { id: 'statutory', label: 'DISCOM & CEIG Approvals', icon: <Zap className="w-3.5 h-3.5 text-amber-600" /> },
        { id: 'snags', label: 'Snag List', icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />, badge: openSnagsCount },
        { id: 'dossier', label: 'Handover Dossier', icon: <Award className="w-3.5 h-3.5 text-blue-600" /> },
        { id: 'cost', label: 'Cost Analysis & Budget' },
        { id: 'specs', label: 'Specs & Worker Logs' },
        { id: 'map', label: 'Site Map' }
      ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 border-b border-[var(--steel-line)] bg-[var(--paper)]">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                isActive
                  ? 'bg-[var(--ink)] text-[var(--paper-raised)] border-[var(--ink)] shadow-xs font-semibold'
                  : 'bg-[var(--paper-raised)] text-[var(--steel)] border-[var(--steel-line)] hover:text-[var(--ink)] hover:border-[var(--ink)]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 ? (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-plex font-bold ${
                  isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'
                }`}>
                  {tab.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {isWorker && (
        <div className="text-[11px] text-[var(--steel)] font-mono-plex flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--rust)] animate-pulse"></span>
          <span>Field Mode Active • Ground uploads enabled</span>
        </div>
      )}
    </div>
  );
};
