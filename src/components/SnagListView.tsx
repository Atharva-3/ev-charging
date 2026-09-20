import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Filter,
  User,
  Calendar,
  MapPin,
  Camera,
  Eye,
  Check,
  X,
  ShieldAlert,
  Flame,
  FileCheck,
  ChevronRight,
  ZoomIn
} from 'lucide-react';
import { Site, SiteSnag, SnagSeverity, SnagStatus, UserSession, UserAccount } from '../types';
import { WatermarkCameraModal } from './WatermarkCameraModal';

interface SnagListViewProps {
  site: Site;
  snags: SiteSnag[];
  userSession?: UserSession | null;
  usersList?: UserAccount[];
  onAddSnag: (snag: SiteSnag) => void;
  onUpdateSnag: (snag: SiteSnag) => void;
  onDeleteSnag?: (snagId: string) => void;
}

export const SnagListView: React.FC<SnagListViewProps> = ({
  site,
  snags,
  userSession,
  usersList = [],
  onAddSnag,
  onUpdateSnag,
  onDeleteSnag
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [activeResolveSnag, setActiveResolveSnag] = useState<SiteSnag | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [resolutionPhoto, setResolutionPhoto] = useState<string | null>(null);
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState<boolean>(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // New Snag Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<SiteSnag['category']>('Electrical & Cabling' as any);
  const [newSeverity, setNewSeverity] = useState<SnagSeverity>('major');
  const [newLocation, setNewLocation] = useState('');
  const [newAssignee, setNewAssignee] = useState(usersList.find((u) => u.role === 'worker')?.name || 'Sunil Kumar');
  const [newTargetDate, setNewTargetDate] = useState('');

  const siteSnags = snags.filter((s) => s.siteId === site.id);

  // Metrics
  const totalSnags = siteSnags.length;
  const criticalCount = siteSnags.filter((s) => s.severity === 'critical' && s.status !== 'resolved').length;
  const majorCount = siteSnags.filter((s) => s.severity === 'major' && s.status !== 'resolved').length;
  const minorCount = siteSnags.filter((s) => s.severity === 'minor' && s.status !== 'resolved').length;
  const resolvedCount = siteSnags.filter((s) => s.status === 'resolved').length;

  const filteredSnags = siteSnags.filter((s) => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && s.severity !== filterSeverity) return false;
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const assignedUser = usersList.find((u) => u.name === newAssignee);

    const newSnag: SiteSnag = {
      id: `snag-${Date.now()}`,
      siteId: site.id,
      title: newTitle.trim(),
      category: newCategory,
      severity: newSeverity,
      status: 'open',
      locationDetails: newLocation.trim() || undefined,
      assignedTo: newAssignee,
      assignedToBadge: assignedUser?.badgeId || 'VST-WRK-01',
      targetDate: newTargetDate || undefined,
      createdByName: userSession?.name || 'Er. Quality Auditor',
      createdByBadge: userSession?.badgeId || 'VST-CTRL-01',
      createdAt: new Date().toISOString(),
      resolutionNotes: ''
    };

    onAddSnag(newSnag);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewLocation('');
  };

  const handleStartResolve = (snag: SiteSnag) => {
    setActiveResolveSnag(snag);
    setResolutionNotes(snag.resolutionNotes || '');
    setResolutionPhoto(snag.photoAfter || null);
  };

  const handleCompleteResolve = () => {
    if (!activeResolveSnag) return;
    const updated: SiteSnag = {
      ...activeResolveSnag,
      status: 'resolved',
      resolutionNotes: resolutionNotes.trim() || 'Defect verified rectified on site.',
      photoAfter: resolutionPhoto || undefined,
      resolvedAt: new Date().toISOString(),
      resolvedBy: `${userSession?.name || 'Field Lead'} (${userSession?.badgeId || 'VST-WRK-01'})`
    };
    onUpdateSnag(updated);
    setActiveResolveSnag(null);
  };

  const handleToggleStatus = (snag: SiteSnag, nextStatus: SnagStatus) => {
    const updated: SiteSnag = {
      ...snag,
      status: nextStatus
    };
    onUpdateSnag(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Metrics */}
      <div className="bg-[var(--paper-raised)] p-5 rounded-2xl border border-[var(--steel-line)] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 text-red-400 flex items-center justify-center shadow-xs shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-condensed font-bold text-xl text-[var(--ink)]">
                  Snag List &amp; Quality Punch Points
                </h2>
                <span className="font-mono-plex text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  Site: {site.name}
                </span>
              </div>
              <p className="text-xs text-[var(--steel)] mt-0.5 leading-relaxed max-w-2xl">
                Defect tracking and corrective action requests (CAR) prior to statutory CEIG physical audit and client commercial handover.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--rust)] hover:bg-[var(--rust-hover)] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Raise Snag Ticket</span>
          </button>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-white border border-[var(--steel-line)]">
            <span className="text-[10px] uppercase font-mono-plex text-[var(--steel)] font-medium block">
              Total Recorded
            </span>
            <span className="font-condensed font-bold text-2xl text-[var(--ink)] block mt-0.5">
              {totalSnags}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-red-50/70 border border-red-200">
            <span className="text-[10px] uppercase font-mono-plex text-red-800 font-semibold block flex items-center gap-1">
              <Flame className="w-3 h-3 text-red-600" />
              Critical (Blockers)
            </span>
            <span className="font-condensed font-bold text-2xl text-red-700 block mt-0.5">
              {criticalCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-[10px] uppercase font-mono-plex text-amber-800 font-semibold block">
              Major (Handover)
            </span>
            <span className="font-condensed font-bold text-2xl text-amber-700 block mt-0.5">
              {majorCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
            <span className="text-[10px] uppercase font-mono-plex text-blue-800 font-semibold block">
              Minor (Cosmetic)
            </span>
            <span className="font-condensed font-bold text-2xl text-blue-700 block mt-0.5">
              {minorCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[10px] uppercase font-mono-plex text-emerald-800 font-semibold block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Rectified
            </span>
            <span className="font-condensed font-bold text-2xl text-emerald-700 block mt-0.5">
              {resolvedCount}
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--steel-line)] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--steel)] font-medium flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Status:
            </span>
            {['all', 'open', 'in-progress', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg border capitalize transition-colors cursor-pointer text-[11px] font-medium ${
                  filterStatus === st
                    ? 'bg-[var(--ink)] text-white border-[var(--ink)] font-semibold'
                    : 'bg-white text-[var(--steel)] border-[var(--steel-line)] hover:text-[var(--ink)]'
                }`}
              >
                {st === 'all' ? 'All Statuses' : st.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[var(--steel)] font-medium">Severity:</span>
            {['all', 'critical', 'major', 'minor'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg border capitalize transition-colors cursor-pointer text-[11px] font-medium ${
                  filterSeverity === sev
                    ? 'bg-[var(--ink)] text-white border-[var(--ink)] font-semibold'
                    : 'bg-white text-[var(--steel)] border-[var(--steel-line)] hover:text-[var(--ink)]'
                }`}
              >
                {sev === 'all' ? 'All Severity' : sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Snags Card Grid */}
      {filteredSnags.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-[var(--steel-line)] rounded-2xl bg-white space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-condensed font-bold text-lg text-[var(--ink)]">
            No Snags Found
          </h3>
          <p className="text-xs text-[var(--steel)] max-w-sm mx-auto">
            {filterStatus !== 'all' || filterSeverity !== 'all'
              ? 'No punch items match the selected filter combination.'
              : 'Zero active punch points recorded for this station. Quality inspection cleared.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSnags.map((snag) => {
            const isResolved = snag.status === 'resolved';

            return (
              <div
                key={snag.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isResolved
                    ? 'border-emerald-200 bg-white/70 opacity-90'
                    : snag.severity === 'critical'
                    ? 'border-red-300 bg-red-50/20'
                    : 'border-[var(--steel-line)] bg-white'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  {/* Left Side: Badges and Title */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Severity Pill */}
                      {snag.severity === 'critical' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                          <Flame className="w-3 h-3 text-red-600" />
                          <span>Critical Blocker</span>
                        </span>
                      ) : snag.severity === 'major' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Major Defect</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-300">
                          <span>Minor Item</span>
                        </span>
                      )}

                      {/* Status Pill */}
                      {snag.status === 'resolved' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Rectified &amp; Closed</span>
                        </span>
                      ) : snag.status === 'in-progress' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Work In Progress</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                          <span>Open Ticket</span>
                        </span>
                      )}

                      <span className="text-xs font-mono-plex text-[var(--steel)]">
                        {snag.category}
                      </span>
                    </div>

                    <h3 className="font-condensed font-bold text-base sm:text-lg text-[var(--ink)] leading-snug">
                      {snag.title}
                    </h3>

                    {snag.locationDetails && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--steel)]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{snag.locationDetails}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 self-start shrink-0">
                    {!isResolved && (
                      <>
                        {snag.status === 'open' && (
                          <button
                            onClick={() => handleToggleStatus(snag, 'in-progress')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Mark In-Progress</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleStartResolve(snag)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--green)] hover:opacity-95 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Close &amp; Rectify</span>
                        </button>
                      </>
                    )}
                    {isResolved && (
                      <button
                        onClick={() => handleToggleStatus(snag, 'open')}
                        className="text-[11px] text-[var(--steel)] hover:text-red-700 underline cursor-pointer"
                      >
                        Reopen Ticket
                      </button>
                    )}
                  </div>
                </div>

                {/* Metadata & Assignee Details Footer */}
                <div className="mt-4 pt-3 border-t border-[var(--steel-line)] grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[var(--steel)]">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Assigned:{' '}
                      <strong className="text-[var(--ink)]">{snag.assignedTo || 'Unassigned'}</strong>{' '}
                      ({snag.assignedToBadge || 'Field'})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Target Date:{' '}
                      <strong className="text-[var(--ink)]">{snag.targetDate || 'Urgent'}</strong>
                    </span>
                  </div>

                  <div className="text-right sm:text-left text-[11px]">
                    Raised by {snag.createdByName || 'Site Controller'}
                  </div>
                </div>

                {/* Resolution Notes & Photo Annexure */}
                {snag.resolutionNotes && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Resolution Clearance Notes:</span>
                    </div>
                    <p className="leading-relaxed">{snag.resolutionNotes}</p>
                    {snag.resolvedBy && (
                      <div className="text-[10.5px] text-emerald-800 font-mono-plex">
                        Verified by: {snag.resolvedBy} on{' '}
                        {snag.resolvedAt ? new Date(snag.resolvedAt).toLocaleDateString('en-IN') : 'Site Audit'}
                      </div>
                    )}
                    {snag.photoAfter && (
                      <div className="pt-1">
                        <button
                          onClick={() => setPreviewPhotoUrl(snag.photoAfter!)}
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold hover:underline cursor-pointer"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>View Watermarked Rectification Photo Proof</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Raise New Snag Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[var(--paper)] rounded-2xl border border-[var(--steel-line)] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--steel-line)] bg-[var(--paper-raised)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[var(--rust)]" />
                <h3 className="font-condensed font-bold text-lg text-[var(--ink)]">
                  Raise Snag / Punch Point Ticket
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[var(--steel)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                  Defect Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Earth pit EP-02 resistance test reads 2.45 Ω (must be ≤ 2.0 Ω for CEIG)"
                  className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-xl text-xs font-sans focus:outline-hidden focus:border-[var(--ink)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                    Severity *
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as SnagSeverity)}
                    className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-xl font-medium"
                  >
                    <option value="critical">Critical (Blocks Energization)</option>
                    <option value="major">Major (Blocks Handover)</option>
                    <option value="minor">Minor (Cosmetic/Post-Launch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-xl font-medium"
                  >
                    <option value="Earthing & Lightning">Earthing &amp; Lightning</option>
                    <option value="HT / Transformer">HT / Transformer</option>
                    <option value="LT Panels & Cabling">LT Panels &amp; Cabling</option>
                    <option value="EVSE Chargers">EVSE Chargers</option>
                    <option value="Civil & Foundation">Civil &amp; Foundation</option>
                    <option value="Safety & Signage">Safety &amp; Signage</option>
                    <option value="Statutory / Quality">Statutory / Quality</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                    Assign Technician *
                  </label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-xl font-medium"
                  >
                    {usersList.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} ({u.badgeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                  Location / Yard Section
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g. Substation Yard South-West, Dispenser Bay #2"
                  className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--steel-line)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--steel-line)] text-xs font-semibold text-[var(--ink)] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--rust)] hover:bg-[var(--rust-hover)] text-white text-xs font-semibold shadow-xs"
                >
                  Create Snag Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Snag Modal */}
      {activeResolveSnag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-[var(--paper)] rounded-2xl border border-[var(--steel-line)] shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--steel-line)] bg-[var(--paper-raised)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-condensed font-bold text-lg text-[var(--ink)]">
                  Rectify &amp; Close Snag Ticket
                </h3>
              </div>
              <button
                onClick={() => setActiveResolveSnag(null)}
                className="p-1 rounded-lg text-[var(--steel)] hover:text-[var(--ink)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                <span className="font-semibold block text-[11px] uppercase font-mono-plex text-amber-800">
                  Defect Description
                </span>
                <span className="font-bold text-xs mt-0.5 block">{activeResolveSnag.title}</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                  Rectification Notes &amp; Action Taken *
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g., Bentonite treatment added to earth pit; re-measured with Megger meter, resistance reduced to 1.35 Ω compliant with CEIG."
                  className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-xl focus:outline-hidden focus:border-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                  Rectified Photo Proof (Watermarked)
                </label>
                {resolutionPhoto ? (
                  <div className="relative border rounded-xl overflow-hidden bg-black max-h-48 flex items-center justify-center">
                    <img
                      src={resolutionPhoto}
                      alt="Rectified Proof"
                      className="max-h-48 w-auto object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setResolutionPhoto(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsWatermarkModalOpen(true)}
                    className="w-full py-3 px-4 border-2 border-dashed border-[var(--steel-line)] rounded-xl bg-white hover:bg-amber-50/50 flex items-center justify-center gap-2 text-xs font-semibold text-[var(--rust)] transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture / Upload Watermarked Rectification Photo</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--steel-line)]">
                <button
                  type="button"
                  onClick={() => setActiveResolveSnag(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--steel-line)] text-xs font-semibold text-[var(--ink)] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteResolve}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--green)] hover:opacity-95 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Mark Rectified &amp; Sign-off</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Watermarked Camera Modal for Snag Resolution */}
      {isWatermarkModalOpen && activeResolveSnag && (
        <WatermarkCameraModal
          isOpen={isWatermarkModalOpen}
          onClose={() => setIsWatermarkModalOpen(false)}
          site={site}
          itemCode={activeResolveSnag.id}
          itemTitle={`Rectification: ${activeResolveSnag.title}`}
          userSession={userSession}
          onPhotoSaved={(dataUrl) => {
            setResolutionPhoto(dataUrl);
            setIsWatermarkModalOpen(false);
          }}
        />
      )}

      {/* Full Photo Zoom Modal */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewPhotoUrl}
              alt="Proof"
              className="max-h-[85vh] w-auto rounded-xl object-contain mx-auto"
            />
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
