import React, { useState } from 'react';
import {
  MapPin,
  Zap,
  CheckCircle2,
  Calendar,
  User,
  Plus,
  ArrowRight,
  TrendingUp,
  Building2,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { Site, SiteTrackerState, BoqCategory } from '../types';
import { getBoqStats, getDocStats, fmtMoney } from '../utils/formatters';

interface SiteDirectoryViewProps {
  sites: Site[];
  allState: Record<string, SiteTrackerState>;
  customBoqs: Record<string, BoqCategory[]>;
  userRole?: 'manager' | 'worker';
  getCategories: (siteId: string) => BoqCategory[];
  onOpenSitePage: (siteId: string) => void;
  onAddNewSite: () => void;
  onEditSite: (site: Site) => void;
  onDeleteSite: (siteId: string) => void;
}

export const SiteDirectoryView: React.FC<SiteDirectoryViewProps> = ({
  sites,
  allState,
  userRole = 'manager',
  getCategories,
  onOpenSitePage,
  onAddNewSite,
  onEditSite,
  onDeleteSite
}) => {
  const isManager = userRole === 'manager';
  const isWorker = userRole === 'worker';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Calculate portfolio totals
  let totalPlannedBudget = 0;
  let totalActualSpend = 0;
  let totalItemsCount = 0;
  let totalPctSum = 0;

  sites.forEach((site) => {
    const cats = getCategories(site.id);
    const st = allState[site.id];
    const boqStats = getBoqStats(cats, st);
    totalPlannedBudget += boqStats.plannedTotal;
    totalActualSpend += boqStats.actualTotal;
    totalItemsCount += boqStats.totalItems;
    totalPctSum += boqStats.pct;
  });

  const avgBoqPct = sites.length > 0 ? Math.round(totalPctSum / sites.length) : 0;

  // Filtered sites
  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (site.location && site.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (site.engineerInCharge && site.engineerInCharge.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (site.discomDivision && site.discomDivision.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || (site.status || 'Planning').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const statusStyles: Record<string, string> = {
    'planning': 'bg-purple-100 text-purple-800 border-purple-200',
    'civil work': 'bg-amber-100 text-amber-800 border-amber-200',
    'electrical i&c': 'bg-blue-100 text-blue-800 border-blue-200',
    'testing & approvals': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'commissioned': 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Portfolio Overview Strip */}
      <div className="bg-[var(--paper-raised)] border border-[var(--steel-line)] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--steel-line)]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-[10px] font-mono-plex uppercase font-semibold bg-[var(--ink)] text-white rounded">
                Multi-Site Management
              </span>
              <span className="text-xs text-[var(--steel)]">
                Individual Workspace &amp; BOQ Engine
              </span>
            </div>
            <h2 className="font-condensed font-bold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
              EV Charging Infrastructure Portfolio
            </h2>
            <p className="text-xs text-[var(--steel)] max-w-2xl">
              Each site operates as its own dedicated individual page with customized BOQ items, geotagged compliance checklists, DISCOM approvals, and procurement cost variance tracking.
            </p>
          </div>

          {isManager ? (
            <button
              onClick={onAddNewSite}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--ink)] text-[var(--paper-raised)] text-xs font-semibold rounded-lg hover:bg-[#132029] transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Site Page</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="font-semibold">Field Crew Mode:</span> Select assigned site to update execution status &amp; submit photos.
            </div>
          )}
        </div>

        {/* Aggregate KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 bg-white border border-[var(--steel-line)] rounded-lg">
            <div className="text-[11px] font-semibold text-[var(--steel)] uppercase tracking-wider mb-0.5">
              Active Sites
            </div>
            <div className="font-mono-plex text-xl sm:text-2xl font-bold text-[var(--ink)]">
              {sites.length}
            </div>
            <div className="text-[11px] text-[var(--steel)]">Individual Project Pages</div>
          </div>

          <div className="p-3 bg-white border border-[var(--steel-line)] rounded-lg">
            <div className="text-[11px] font-semibold text-[var(--steel)] uppercase tracking-wider mb-0.5">
              Avg Execution
            </div>
            <div className="font-mono-plex text-xl sm:text-2xl font-bold text-[var(--green)]">
              {avgBoqPct}%
            </div>
            <div className="text-[11px] text-[var(--steel)]">Across all BOQ items</div>
          </div>

          <div className="p-3 bg-white border border-[var(--steel-line)] rounded-lg">
            <div className="text-[11px] font-semibold text-[var(--steel)] uppercase tracking-wider mb-0.5">
              Planned Capital Budget
            </div>
            <div className="font-mono-plex text-xl sm:text-2xl font-bold text-[var(--ink)]">
              ₹{fmtMoney(totalPlannedBudget)}
            </div>
            <div className="text-[11px] text-[var(--steel)]">Sanctioned BOQs</div>
          </div>

          <div className="p-3 bg-white border border-[var(--steel-line)] rounded-lg">
            <div className="text-[11px] font-semibold text-[var(--steel)] uppercase tracking-wider mb-0.5">
              Procured Actuals
            </div>
            <div className="font-mono-plex text-xl sm:text-2xl font-bold text-[var(--blue)]">
              ₹{fmtMoney(totalActualSpend)}
            </div>
            <div className="text-[11px] text-[var(--steel)]">Verified expenses</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--paper)] p-3 border border-[var(--steel-line)] rounded-lg">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-[var(--steel)] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by site name, location, engineer or DISCOM..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[var(--steel-line)] rounded-md text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-[var(--steel)] font-medium">Stage:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white border border-[var(--steel-line)] rounded-md text-[var(--ink)] cursor-pointer focus:outline-none focus:border-[var(--ink)]"
          >
            <option value="all">All Stages ({sites.length})</option>
            <option value="planning">Planning</option>
            <option value="civil work">Civil Work</option>
            <option value="electrical i&c">Electrical I&amp;C</option>
            <option value="testing & approvals">Testing &amp; Approvals</option>
            <option value="commissioned">Commissioned</option>
          </select>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSites.map((site) => {
          const cats = getCategories(site.id);
          const st = allState[site.id];
          const boqStats = getBoqStats(cats, st);
          const docStats = getDocStats(st);
          const currentStatus = site.status || 'Planning';
          const statusKey = currentStatus.toLowerCase();
          const badgeClass = statusStyles[statusKey] || 'bg-gray-100 text-gray-800 border-gray-200';

          return (
            <div
              key={site.id}
              className="bg-[var(--paper-raised)] border border-[var(--steel-line)] rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-[var(--steel-line)] bg-white/60">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${badgeClass}`}
                      >
                        {currentStatus}
                      </span>
                      {site.sanctionedLoad && (
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-mono-plex px-1.5 py-0.5 bg-[var(--paper)] border border-[var(--steel-line)] rounded text-[var(--ink)] font-semibold">
                          <Zap className="w-3 h-3 text-[var(--amber)]" />
                          {site.sanctionedLoad}
                        </span>
                      )}
                    </div>
                    <h3 className="font-condensed font-bold text-xl sm:text-2xl text-[var(--ink)] leading-tight">
                      {site.name}
                    </h3>
                  </div>

                  {/* Top Actions (Manager only) */}
                  {isManager && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditSite(site)}
                        className="p-1.5 text-[var(--steel)] hover:text-[var(--ink)] hover:bg-[var(--paper)] rounded transition-colors cursor-pointer"
                        title="Edit site details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSite(site.id)}
                        disabled={sites.length <= 1}
                        className={`p-1.5 rounded transition-colors ${
                          sites.length <= 1
                            ? 'opacity-30 cursor-not-allowed text-[var(--steel)]'
                            : 'text-[var(--steel)] hover:text-[var(--rust)] hover:bg-red-50 cursor-pointer'
                        }`}
                        title={sites.length <= 1 ? 'Cannot delete the only site' : 'Delete site'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Location & Details */}
                <div className="space-y-1.5 text-xs text-[var(--steel)]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[var(--rust)] shrink-0" />
                    <span className="truncate">{site.location || 'Location not specified'}</span>
                  </div>

                  {site.chargerCount && (
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[var(--amber)] shrink-0" />
                      <span className="truncate">{site.chargerCount}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-[11px]">
                    {site.engineerInCharge && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {site.engineerInCharge}
                      </span>
                    )}
                    {site.targetDate && (
                      <span className="flex items-center gap-1 font-mono-plex">
                        <Calendar className="w-3 h-3 text-[var(--rust)]" />
                        Target: {site.targetDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Metrics & Progress */}
              <div className="p-4 space-y-3.5 bg-[var(--paper-raised)]">
                {/* Progress bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-[var(--ink)] flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5 text-[var(--green)]" />
                        BOQ Items Execution
                      </span>
                      <span className="font-mono-plex font-bold text-[var(--green)]">
                        {boqStats.pct}% ({cats.reduce((acc, c) => acc + c.items.length, 0)} items)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--steel-line)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--green)] transition-all duration-300"
                        style={{ width: `${boqStats.pct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-semibold text-[var(--ink)] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--blue)]" />
                        Compliance &amp; Inspection Photos
                      </span>
                      <span className="font-mono-plex font-bold text-[var(--blue)]">
                        {docStats.pct}% ({docStats.checked}/{docStats.total})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--steel-line)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--blue)] transition-all duration-300"
                        style={{ width: `${docStats.pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="pt-2 border-t border-[var(--steel-line)] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-[10.5px] text-[var(--steel)] uppercase tracking-wider">
                      Planned BOQ
                    </div>
                    <div className="font-mono-plex font-bold text-[var(--ink)] text-sm">
                      ₹{fmtMoney(boqStats.plannedTotal)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10.5px] text-[var(--steel)] uppercase tracking-wider">
                      Actual Procurement
                    </div>
                    <div className="font-mono-plex font-bold text-[var(--blue)] text-sm">
                      ₹{fmtMoney(boqStats.actualTotal)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="p-3 bg-white/40 border-t border-[var(--steel-line)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--steel)]">
                  {cats.length} BOQ Categories
                </span>
                <button
                  onClick={() => onOpenSitePage(site.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--ink)] text-[var(--paper-raised)] text-xs font-semibold rounded-md hover:bg-[#132029] transition-all cursor-pointer shadow-xs"
                >
                  <span>Open Site Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
