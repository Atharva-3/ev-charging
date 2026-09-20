import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  Zap,
  Building2,
  Calendar,
  User,
  Sliders
} from 'lucide-react';
import { Site } from '../types';
import { SiteModal } from './SiteModal';

interface SiteSelectorProps {
  sites: Site[];
  activeSiteId: string;
  userRole?: 'manager' | 'worker';
  onSelectSite: (id: string) => void;
  onBackToDirectory?: () => void;
  onAddSite: (siteData: Partial<Site>, templateChoice?: string) => void;
  onEditSite: (id: string, siteData: Partial<Site>) => void;
  onDeleteSite: (id: string) => void;
}

export const SiteSelector: React.FC<SiteSelectorProps> = ({
  sites,
  activeSiteId,
  userRole = 'manager',
  onSelectSite,
  onBackToDirectory,
  onAddSite,
  onEditSite,
  onDeleteSite
}) => {
  const isManager = userRole === 'manager';
  const isWorker = userRole === 'worker';
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);

  const activeSite = sites.find((s) => s.id === activeSiteId) || sites[0];

  const handleDelete = () => {
    if (sites.length <= 1) return;
    if (
      window.confirm(
        `Delete "${activeSite?.name || activeSiteId}" and all its tracked data? This cannot be undone.`
      )
    ) {
      onDeleteSite(activeSiteId);
    }
  };

  const statusStyles: Record<string, string> = {
    'planning': 'bg-purple-100 text-purple-800 border-purple-200',
    'civil work': 'bg-amber-100 text-amber-800 border-amber-200',
    'electrical i&c': 'bg-blue-100 text-blue-800 border-blue-200',
    'testing & approvals': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'commissioned': 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  const currentStatus = activeSite?.status || 'Planning';
  const badgeClass = statusStyles[currentStatus.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className="border-b border-[var(--steel-line)] bg-[var(--paper)]">
      {/* Top Breadcrumb and Actions Bar */}
      <div className="px-6 py-2.5 bg-black/[0.02] border-b border-[var(--steel-line)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {onBackToDirectory && (
            <button
              onClick={onBackToDirectory}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--steel-line)] bg-white text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer font-medium shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Sites Directory</span>
            </button>
          )}

          <span className="text-[var(--steel)]">/</span>

          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[var(--ink)]" />
            <select
              value={activeSiteId}
              onChange={(e) => onSelectSite(e.target.value)}
              className="font-medium text-xs py-0.5 px-2 rounded border border-[var(--steel-line)] bg-white text-[var(--ink)] cursor-pointer focus:outline-none focus:border-[var(--ink)]"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Site Actions */}
        <div className="flex items-center gap-2">
          {isManager && (
            <button
              onClick={() => setModalMode('add')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--steel-line)] bg-white text-xs font-medium text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Site</span>
            </button>
          )}

          <button
            onClick={() => setModalMode('edit')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--steel-line)] bg-white text-xs font-medium text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{isWorker ? 'View Specs' : 'Edit Details'}</span>
          </button>

          {isManager && (
            <button
              onClick={handleDelete}
              disabled={sites.length <= 1}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--steel-line)] text-xs font-medium transition-colors ${
                sites.length <= 1
                  ? 'opacity-40 cursor-not-allowed text-[var(--steel)]'
                  : 'text-[var(--steel)] hover:text-[var(--rust)] hover:border-[var(--rust)] cursor-pointer bg-white'
              }`}
              title={sites.length <= 1 ? 'Cannot delete the only remaining site' : 'Delete this site'}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Site Identity Banner */}
      <div className="px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${badgeClass}`}
            >
              {currentStatus}
            </span>
            {activeSite?.sanctionedLoad && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-mono-plex px-2 py-0.5 bg-white border border-[var(--steel-line)] rounded font-semibold text-[var(--ink)]">
                <Zap className="w-3 h-3 text-[var(--amber)]" />
                {activeSite.sanctionedLoad}
              </span>
            )}
            {activeSite?.discomDivision && (
              <span className="text-[11px] text-[var(--steel)] bg-black/[0.03] px-2 py-0.5 rounded border border-[var(--steel-line)]">
                {activeSite.discomDivision}
              </span>
            )}
          </div>

          <h2 className="font-condensed font-bold text-2xl sm:text-3xl text-[var(--ink)] leading-tight">
            {activeSite?.name}
          </h2>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[var(--steel)]">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--rust)] shrink-0" />
              <span>{activeSite?.location || 'No location set'}</span>
            </div>
            {activeSite?.chargerCount && (
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-[var(--amber)] shrink-0" />
                <span>{activeSite.chargerCount}</span>
              </div>
            )}
            {activeSite?.engineerInCharge && (
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>In-Charge: {activeSite.engineerInCharge}</span>
              </div>
            )}
            {activeSite?.targetDate && (
              <div className="flex items-center gap-1 font-mono-plex">
                <Calendar className="w-3.5 h-3.5 text-[var(--rust)] shrink-0" />
                <span>Target: {activeSite.targetDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <SiteModal
        isOpen={modalMode !== null}
        site={modalMode === 'edit' ? activeSite : null}
        existingSites={sites}
        onClose={() => setModalMode(null)}
        onSave={(siteData, templateChoice) => {
          if (modalMode === 'edit' && activeSite) {
            onEditSite(activeSite.id, siteData);
          } else {
            onAddSite(siteData, templateChoice);
          }
          setModalMode(null);
        }}
      />
    </div>
  );
};
