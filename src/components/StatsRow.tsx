import React from 'react';
import { BoqStats, DocStats, ActiveView } from '../types';
import { fmtMoney } from '../utils/formatters';

interface StatsRowProps {
  boqStats: BoqStats;
  docStats: DocStats;
  activeView: ActiveView;
}

export const StatsRow: React.FC<StatsRowProps> = ({ boqStats, docStats, activeView }) => {
  const variance = boqStats.actualTotal - boqStats.plannedTotal;
  const isOver = variance > 0;
  const isUnder = variance < 0;

  if (activeView === 'map') return null;

  return (
    <div className="px-6 pt-4 pb-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        <div className="bg-[var(--paper-raised)] border border-[var(--steel-line)] rounded-lg p-3">
          <div className="text-[10px] sm:text-[11px] font-semibold text-[var(--steel)] uppercase tracking-wider">
            BOQ Progress
          </div>
          <div className="font-mono-plex font-medium text-lg sm:text-xl text-[var(--ink)] mt-1 flex items-baseline gap-1">
            <span>{boqStats.pct}%</span>
            <span className="text-[10px] text-[var(--steel)] font-normal">
              ({boqStats.totalItems} items)
            </span>
          </div>
        </div>

        <div className="bg-[var(--paper-raised)] border border-[var(--steel-line)] rounded-lg p-3">
          <div className="text-[10px] sm:text-[11px] font-semibold text-[var(--steel)] uppercase tracking-wider">
            Planned BOQ Value
          </div>
          <div className="font-mono-plex font-medium text-lg sm:text-xl text-[var(--ink)] mt-1">
            ₹{fmtMoney(boqStats.plannedTotal)}
          </div>
        </div>

        <div className="bg-[var(--paper-raised)] border border-[var(--steel-line)] rounded-lg p-3">
          <div className="text-[10px] sm:text-[11px] font-semibold text-[var(--steel)] uppercase tracking-wider">
            Actual Cost So Far
          </div>
          <div className="font-mono-plex font-medium text-lg sm:text-xl text-[var(--ink)] mt-1">
            ₹{fmtMoney(boqStats.actualTotal)}
          </div>
        </div>

        <div className="bg-[var(--paper-raised)] border border-[var(--steel-line)] rounded-lg p-3">
          <div className="text-[10px] sm:text-[11px] font-semibold text-[var(--steel)] uppercase tracking-wider">
            Variance
          </div>
          <div
            className={`font-mono-plex font-medium text-lg sm:text-xl mt-1 ${
              isOver ? 'text-[var(--rust)]' : isUnder ? 'text-[var(--green)]' : 'text-[var(--ink)]'
            }`}
          >
            {variance >= 0 ? '+' : ''}₹{fmtMoney(variance)}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[var(--paper-raised)] border border-[var(--steel-line)] rounded-lg p-3">
          <div className="text-[10px] sm:text-[11px] font-semibold text-[var(--steel)] uppercase tracking-wider">
            Docs / Photos Complete
          </div>
          <div className="font-mono-plex font-medium text-lg sm:text-xl text-[var(--ink)] mt-1 flex items-baseline gap-1.5">
            <span>
              {docStats.checked} / {docStats.total}
            </span>
            <span className="text-[11px] text-[var(--steel)] font-normal">
              ({docStats.pct}%)
            </span>
          </div>
        </div>
      </div>

      {activeView === 'boq' && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--steel)] pt-3 pb-1">
          <span className="text-[11px] uppercase tracking-wider font-semibold">Status Legend:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--steel-line)] border border-[var(--steel)]/30"></span>
            <span>Pending</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#FBF0DC] border border-[var(--amber)]"></span>
            <span>Ordered</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#E4EEE8] border border-[var(--green)]"></span>
            <span>Installed</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#DCEAF2] border border-[var(--blue)]"></span>
            <span>Verified</span>
          </span>
        </div>
      )}
    </div>
  );
};
