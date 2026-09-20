import React, { useState } from 'react';
import { Camera, Check, X, Plus, Trash2, ShieldCheck, HardHat, Eye, CheckCircle2, AlertTriangle, ZoomIn, Stamp } from 'lucide-react';
import { SiteTrackerState, ChecklistItem, UserSession, Site } from '../types';
import { DOC_CHECKLIST } from '../data/initialData';
import { compressImageFile } from '../utils/storage';
import { WatermarkCameraModal } from './WatermarkCameraModal';

interface DocsViewProps {
  siteId: string;
  site?: Site;
  siteState?: SiteTrackerState;
  photos: Record<string, string>;
  userSession?: UserSession | null;
  userRole?: 'manager' | 'worker';
  onToggleDoc: (docKey: string) => void;
  onSavePhoto: (docKey: string, dataUrl: string) => void;
  onDeletePhoto: (docKey: string) => void;
  onAddChecklistItem?: (groupKey: string, text: string, photo: boolean) => void;
  onDeleteChecklistItem?: (groupKey: string, customItemIndex: number) => void;
}

export const DocsView: React.FC<DocsViewProps> = ({
  siteId,
  site,
  siteState,
  photos,
  userSession,
  userRole,
  onToggleDoc,
  onSavePhoto,
  onDeletePhoto,
  onAddChecklistItem,
  onDeleteChecklistItem
}) => {
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);
  const [previewCaption, setPreviewCaption] = useState<string>('');
  const [activeAddGroup, setActiveAddGroup] = useState<string | null>(null);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newChecklistPhoto, setNewChecklistPhoto] = useState(false);
  const [watermarkModalTarget, setWatermarkModalTarget] = useState<{ key: string; text: string } | null>(null);

  const effectiveRole = userRole || userSession?.role || 'manager';
  const isWorker = effectiveRole === 'worker';
  const isManager = effectiveRole === 'manager';

  // Count photos required vs uploaded
  let totalPhotoRequired = 0;
  let totalPhotoUploaded = 0;

  Object.entries(DOC_CHECKLIST).forEach(([gk, group]) => {
    const customItems: ChecklistItem[] = siteState?.customChecklists?.[gk] || [];
    const all = [...group.items, ...customItems];
    all.forEach((item, idx) => {
      if (item.photo) {
        totalPhotoRequired++;
        if (photos[`${gk}::${idx}`]) {
          totalPhotoUploaded++;
        }
      }
    });
  });

  const handlePhotoUpload = async (docKey: string, file: File) => {
    try {
      const dataUrl = await compressImageFile(file, 900, 0.6);
      onSavePhoto(docKey, dataUrl);
    } catch (err) {
      console.error('Photo compression error', err);
      alert('Unable to process photo file.');
    }
  };

  const handleAddSubmit = (e: React.FormEvent, groupKey: string) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    onAddChecklistItem?.(groupKey, newChecklistText.trim(), newChecklistPhoto);
    setNewChecklistText('');
    setNewChecklistPhoto(false);
    setActiveAddGroup(null);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Role-Specific Context Banner */}
      {isWorker ? (
        <div className="p-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--rust)] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-amber-950 text-sm">
                Field Evidence Uploader (Technician: {userSession?.name})
              </div>
              <p className="text-amber-800/90 text-xs mt-0.5 leading-relaxed">
                Take high-resolution ground verification photos using your phone or device camera. Photos are compressed and saved directly for Site Controller audit.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center font-mono-plex shrink-0 bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200 text-amber-900 font-semibold">
            <span>Evidence Uploaded:</span>
            <span className="text-[var(--rust)]">{totalPhotoUploaded} / {totalPhotoRequired} Photos</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-indigo-950 text-sm">
                Site Controller Audit &amp; Verification (Supervisor: {userSession?.name})
              </div>
              <p className="text-indigo-800/90 text-xs mt-0.5 leading-relaxed">
                Auditing site photos and compliance certificates submitted by field workers before final DISCOM CEIG inspection.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center font-mono-plex shrink-0 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-900 font-semibold">
            <span>Audit Status:</span>
            <span className={totalPhotoUploaded === totalPhotoRequired ? 'text-[var(--green)]' : 'text-amber-700'}>
              {totalPhotoUploaded} / {totalPhotoRequired} Received ({Math.round((totalPhotoUploaded / (totalPhotoRequired || 1)) * 100)}%)
            </span>
          </div>
        </div>
      )}

      {Object.entries(DOC_CHECKLIST).map(([groupKey, group]) => {
        const customItems: ChecklistItem[] = siteState?.customChecklists?.[groupKey] || [];
        const allItems = [...group.items, ...customItems];

        const checkedCount = allItems.filter(
          (_, i) => siteState?.docs?.[`${groupKey}::${i}`]
        ).length;

        return (
          <div
            key={groupKey}
            className="border border-[var(--steel-line)] rounded-lg bg-[var(--paper-raised)] overflow-hidden"
          >
            {/* Group Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--steel-line)] bg-black/[0.015]">
              <h2 className="font-condensed font-bold text-base sm:text-lg text-[var(--ink)]">
                {group.title}
              </h2>
              <div className="flex items-center gap-3">
                <span className="font-mono-plex text-xs text-[var(--steel)] font-medium">
                  {checkedCount} / {allItems.length}
                </span>
                {onAddChecklistItem && isManager && (
                  <button
                    onClick={() => setActiveAddGroup(activeAddGroup === groupKey ? null : groupKey)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[var(--steel-line)] bg-white text-[11px] font-medium text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer shadow-xs"
                    title="Add site-specific checklist requirement"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                )}
              </div>
            </div>

            {/* Add Custom Item Form */}
            {activeAddGroup === groupKey && (
              <form
                onSubmit={(e) => handleAddSubmit(e, groupKey)}
                className="p-3 bg-white border-b border-[var(--steel-line)] flex flex-wrap items-center gap-2.5 text-xs"
              >
                <input
                  type="text"
                  required
                  autoFocus
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="e.g. Local Municipal Ward Tree Clearance NOC..."
                  className="flex-1 min-w-[220px] px-2.5 py-1.5 border border-[var(--steel-line)] rounded text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
                <label className="flex items-center gap-1.5 text-xs text-[var(--ink)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newChecklistPhoto}
                    onChange={(e) => setNewChecklistPhoto(e.target.checked)}
                    className="rounded border-[var(--steel-line)] text-[var(--ink)]"
                  />
                  <span>Requires Photo</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveAddGroup(null)}
                    className="px-2.5 py-1 text-xs text-[var(--steel)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[var(--ink)] text-white text-xs font-semibold rounded hover:bg-[#132029] cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            {/* Checklist Items */}
            <div className="divide-y divide-black/[0.04]">
              {allItems.map((item, idx) => {
                const docKey = `${groupKey}::${idx}`;
                const isChecked = !!siteState?.docs?.[docKey];
                const photoData = photos[docKey];
                const isCustom = idx >= group.items.length;
                const customIdx = idx - group.items.length;

                return (
                  <div
                    key={docKey}
                    className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 hover:bg-black/[0.01] transition-colors group ${
                      item.photo && !photoData && isWorker ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* Checkbox and Text */}
                    <div
                      onClick={() => onToggleDoc(docKey)}
                      className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-[200px]"
                    >
                      <div
                        className={`w-4.5 h-4.5 rounded-sm border flex items-center justify-center transition-colors shrink-0 ${
                          isChecked
                            ? 'bg-[var(--green)] border-[var(--green)] text-white'
                            : 'border-[var(--steel-line)] bg-white hover:border-[var(--ink)]'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span
                        className={`text-xs sm:text-[13px] leading-snug transition-colors ${
                          isChecked
                            ? 'text-[var(--steel)] line-through'
                            : 'text-[var(--ink)] font-normal'
                        }`}
                      >
                        {item.text}
                      </span>
                      {isCustom && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono-plex">
                          Custom
                        </span>
                      )}
                    </div>

                    {/* Geotagged Photo slot if required */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.photo && (
                        <div>
                          {photoData ? (
                            <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-200 px-2 py-1 rounded-md">
                              <img
                                src={photoData}
                                alt="Verification Photo"
                                onClick={() => {
                                  setActivePreviewUrl(photoData);
                                  setPreviewCaption(item.text);
                                }}
                                className="w-8 h-8 object-cover rounded border border-emerald-300 cursor-pointer hover:opacity-90 transition-opacity"
                                title="Click to view full photo"
                              />
                              <div className="text-left leading-none">
                                <div className="text-[10px] font-semibold text-emerald-800 font-mono-plex flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Evidence Attached</span>
                                </div>
                                <span className="text-[9.5px] text-emerald-700">
                                  {isManager ? 'Audited' : 'Uploaded'}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setActivePreviewUrl(photoData);
                                  setPreviewCaption(item.text);
                                }}
                                className="p-1 text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
                                title="Inspect photo"
                              >
                                <ZoomIn className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeletePhoto(docKey)}
                                className="p-1 text-[var(--steel)] hover:text-[var(--rust)] transition-colors cursor-pointer"
                                title="Remove photo"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setWatermarkModalTarget({ key: docKey, text: item.text })}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-xs text-amber-900 hover:bg-amber-100 hover:border-amber-400 cursor-pointer transition-colors shadow-2xs font-medium"
                            >
                              <Camera className="w-3.5 h-3.5 text-[var(--rust)]" />
                              <span>{isWorker ? 'Snap Watermarked Photo' : 'Upload Audit Photo'}</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Custom Item Delete */}
                      {isCustom && onDeleteChecklistItem && isManager && (
                        <button
                          onClick={() => onDeleteChecklistItem(groupKey, customIdx)}
                          className="text-[var(--steel)] hover:text-[var(--rust)] p-1 opacity-40 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Remove custom item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Lightbox / Full Photo Preview Modal */}
      {activePreviewUrl && (
        <div
          className="fixed inset-0 bg-[#14191d]/85 flex items-center justify-center z-50 p-4 cursor-pointer"
          onClick={() => setActivePreviewUrl(null)}
        >
          <div
            className="max-w-xl max-h-[85vh] bg-[var(--paper)] rounded-xl p-4 relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePreviewUrl(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center cursor-pointer shadow-md text-sm hover:scale-105 transition-transform"
            >
              ✕
            </button>
            <img
              src={activePreviewUrl}
              alt="Full size verification"
              className="max-h-[70vh] w-auto rounded-lg object-contain border border-[var(--steel-line)]"
            />
            <div className="mt-3 text-center">
              <div className="text-xs font-semibold text-[var(--ink)]">
                {previewCaption || 'Site Geotagged Verification Photograph'}
              </div>
              <div className="text-[11px] text-[var(--steel)] font-mono-plex mt-0.5">
                Timestamped Verification Document &bull; Validated for CEIG / DISCOM Dossier
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Engineering Watermark Photo Capture Modal */}
      {watermarkModalTarget && (
        <WatermarkCameraModal
          isOpen={!!watermarkModalTarget}
          onClose={() => setWatermarkModalTarget(null)}
          site={
            site || {
              id: siteId,
              name: 'EV Charging Substation Site',
              location: 'Rajasthan, India',
              sanctionedLoad: '120 kW',
              status: 'Electrical I&C'
            }
          }
          itemCode={watermarkModalTarget.key}
          itemTitle={watermarkModalTarget.text}
          userSession={userSession}
          existingPhotoUrl={photos[watermarkModalTarget.key]}
          onPhotoSaved={(dataUrl) => {
            onSavePhoto(watermarkModalTarget.key, dataUrl);
            setWatermarkModalTarget(null);
          }}
        />
      )}
    </div>
  );
};
