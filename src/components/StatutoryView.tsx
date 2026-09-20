import React, { useState } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Building2,
  Calendar,
  CreditCard,
  Phone,
  FileText,
  Edit3,
  Save,
  X,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { Site, SiteStatutoryRecord, StatutoryStage, StatutoryStageKey, UserSession } from '../types';

interface StatutoryViewProps {
  site: Site;
  statutoryRecord?: SiteStatutoryRecord;
  userSession?: UserSession | null;
  onSaveStatutory: (updated: SiteStatutoryRecord) => void;
}

export const StatutoryView: React.FC<StatutoryViewProps> = ({
  site,
  statutoryRecord,
  userSession,
  onSaveStatutory
}) => {
  const [editingKey, setEditingKey] = useState<StatutoryStageKey | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<StatutoryStage>>({});

  const isManager = userSession?.role === 'manager';

  const stages: Partial<Record<StatutoryStageKey, StatutoryStage>> = statutoryRecord?.stages || {};
  const stageKeys: StatutoryStageKey[] = [
    'discom_load_sanction',
    'demand_note_payment',
    'transformer_fat_delivery',
    'ceig_inspection_application',
    'ceig_safety_clearance',
    'bidirectional_meter_sync'
  ];

  // Count approved stages
  const approvedCount = stageKeys.filter((k) => stages[k]?.status === 'approved').length;
  const progressPct = Math.round((approvedCount / stageKeys.length) * 100);

  const startEdit = (key: StatutoryStageKey) => {
    if (!isManager) return;
    const current = stages[key];
    setEditingKey(key);
    setEditFormData({
      status: current?.status || 'pending',
      refNumber: current?.refNumber || '',
      appliedDate: current?.appliedDate || '',
      approvedDate: current?.approvedDate || '',
      targetDate: current?.targetDate || '',
      feeAmount: current?.feeAmount || '',
      paymentRef: current?.paymentRef || '',
      officerContact: current?.officerContact || '',
      notes: current?.notes || ''
    });
  };

  const handleSaveEdit = (key: StatutoryStageKey) => {
    if (!statutoryRecord) return;
    const current = stages[key];
    if (!current) return;

    const updatedStage: StatutoryStage = {
      ...current,
      ...editFormData
    };

    const updatedRecord: SiteStatutoryRecord = {
      ...statutoryRecord,
      stages: {
        ...statutoryRecord.stages,
        [key]: updatedStage
      },
      updatedAt: new Date().toISOString(),
      updatedBy: `${userSession?.name || 'Site Controller'} (${userSession?.badgeId || 'VST-CTRL-01'})`
    };

    onSaveStatutory(updatedRecord);
    setEditingKey(null);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved &amp; Cleared</span>
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Submitted / In Verification</span>
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>In Preparation / Working</span>
          </span>
        );
      case 'query-raised':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>Query / Objection Raised</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
            <span>Pending Filing</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Statutory Progress Header */}
      <div className="bg-[var(--paper-raised)] p-5 rounded-2xl border border-[var(--steel-line)] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--ink)] text-amber-400 flex items-center justify-center shadow-xs shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-condensed font-bold text-xl text-[var(--ink)]">
                  DISCOM &amp; CEIG Statutory Clearance Tracker
                </h2>
                <span className="font-mono-plex text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                  Site: {site.name}
                </span>
              </div>
              <p className="text-xs text-[var(--steel)] mt-0.5 leading-relaxed max-w-2xl">
                Mandatory Indian regulatory approval sequence governing 11kV grid interconnection, transformer safety testing, and Chief Electrical Inspector to Government (CEIG) energization order.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 bg-white px-4 py-3 rounded-xl border border-[var(--steel-line)]">
            <div className="text-right">
              <div className="text-[10.5px] uppercase font-mono-plex text-[var(--steel)] font-medium">Clearance Progress</div>
              <div className="font-condensed font-bold text-xl text-[var(--ink)]">
                {approvedCount} / {stageKeys.length} Stages Cleared
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 bg-emerald-50 flex items-center justify-center font-mono-plex font-bold text-xs text-emerald-800">
              {progressPct}%
            </div>
          </div>
        </div>

        {/* Progress Timeline Stepper Bar */}
        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-emerald-600 h-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Context info banner */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 text-xs font-sans">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Statutory Rule:</strong> High-tension EV charging plazas require CEIG approval under Regulation 43 of CEA Safety Regulations before DISCOM energizes the bi-directional TOD meter.
          </span>
        </div>
      </div>

      {/* Statutory Stages List */}
      <div className="space-y-4">
        {stageKeys.map((key, idx) => {
          const stage = stages[key];
          if (!stage) return null;
          const isEditing = editingKey === key;

          return (
            <div
              key={key}
              className={`p-5 rounded-2xl border transition-all ${
                stage.status === 'approved'
                  ? 'border-emerald-300 bg-white'
                  : stage.status === 'query-raised'
                  ? 'border-red-300 bg-red-50/20'
                  : 'border-[var(--steel-line)] bg-[var(--paper-raised)]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Stage Title and Step Number */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-8 h-8 rounded-xl font-mono-plex font-bold text-sm flex items-center justify-center shrink-0 shadow-xs ${
                      stage.status === 'approved'
                        ? 'bg-emerald-600 text-white'
                        : stage.status === 'query-raised'
                        ? 'bg-red-600 text-white'
                        : 'bg-[var(--ink)] text-white'
                    }`}
                  >
                    0{idx + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-condensed font-bold text-lg text-[var(--ink)]">
                        {stage.title}
                      </h3>
                      {getStatusBadge(stage.status)}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--steel)] font-medium mt-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{stage.authority}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Action Button */}
                {isManager && !isEditing && (
                  <button
                    onClick={() => startEdit(key)}
                    className="self-start lg:self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--steel-line)] bg-white text-xs font-semibold text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[var(--steel)]" />
                    <span>Update Stage Status</span>
                  </button>
                )}
              </div>

              {/* Editing Form */}
              {isEditing ? (
                <div className="mt-4 pt-4 border-t border-[var(--steel-line)] space-y-3 bg-white p-4 rounded-xl border">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                        Clearance Status
                      </label>
                      <select
                        value={editFormData.status}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, status: e.target.value as any }))
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[var(--steel-line)] rounded-lg font-medium"
                      >
                        <option value="pending">Pending Filing</option>
                        <option value="in-progress">In Preparation / Drafting</option>
                        <option value="submitted">Submitted to Portal / Under Review</option>
                        <option value="approved">Approved &amp; Certified</option>
                        <option value="query-raised">Query / Clarification Raised</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                        Reference / Certificate No.
                      </label>
                      <input
                        type="text"
                        value={editFormData.refNumber}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, refNumber: e.target.value }))
                        }
                        placeholder="e.g. CEIG/RAJ/2026/7821"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[var(--steel-line)] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                        Statutory Fee / Deposit
                      </label>
                      <input
                        type="text"
                        value={editFormData.feeAmount}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, feeAmount: e.target.value }))
                        }
                        placeholder="e.g. ₹ 4,85,000"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[var(--steel-line)] rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                        Submission / Applied Date
                      </label>
                      <input
                        type="date"
                        value={editFormData.appliedDate}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, appliedDate: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[var(--steel-line)] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                        Approved / Clearance Date
                      </label>
                      <input
                        type="date"
                        value={editFormData.approvedDate}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, approvedDate: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[var(--steel-line)] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                        Payment UTR / Receipt Ref
                      </label>
                      <input
                        type="text"
                        value={editFormData.paymentRef}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, paymentRef: e.target.value }))
                        }
                        placeholder="e.g. RTGS UTR 910248..."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[var(--steel-line)] rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                      Inspector Notes, Observations or Query Reply
                    </label>
                    <textarea
                      rows={2}
                      value={editFormData.notes}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Enter specific remarks, inspector observations, or next action step..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[var(--steel-line)] rounded-lg"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingKey(null)}
                      className="px-3 py-1.5 rounded-lg border border-[var(--steel-line)] text-xs font-semibold text-[var(--ink)] hover:bg-black/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(key)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--green)] text-white text-xs font-semibold hover:opacity-95 shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Read-only Detailed Metadata Grid */
                <div className="mt-4 pt-4 border-t border-[var(--steel-line)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white/70 p-2.5 rounded-xl border border-[var(--steel-line)]">
                    <span className="text-[10.5px] uppercase font-mono-plex text-[var(--steel)] block font-medium">
                      Reference / Token
                    </span>
                    <span className="font-mono-plex font-bold text-[var(--ink)] mt-0.5 block truncate">
                      {stage.refNumber || 'Pending Filing'}
                    </span>
                  </div>

                  <div className="bg-white/70 p-2.5 rounded-xl border border-[var(--steel-line)]">
                    <span className="text-[10.5px] uppercase font-mono-plex text-[var(--steel)] block font-medium">
                      Key Dates
                    </span>
                    <span className="font-sans text-[var(--ink)] mt-0.5 block">
                      {stage.approvedDate
                        ? `Approved: ${stage.approvedDate}`
                        : stage.appliedDate
                        ? `Filed: ${stage.appliedDate}`
                        : `Target: ${stage.targetDate || 'In Q3'}`}
                    </span>
                  </div>

                  <div className="bg-white/70 p-2.5 rounded-xl border border-[var(--steel-line)]">
                    <span className="text-[10.5px] uppercase font-mono-plex text-[var(--steel)] block font-medium">
                      Statutory Fee / Receipt
                    </span>
                    <span className="font-sans text-[var(--ink)] mt-0.5 block truncate">
                      {stage.feeAmount || stage.paymentRef || 'Standard Tariff'}
                    </span>
                  </div>

                  <div className="bg-white/70 p-2.5 rounded-xl border border-[var(--steel-line)]">
                    <span className="text-[10.5px] uppercase font-mono-plex text-[var(--steel)] block font-medium">
                      Compliance Status
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {stage.status === 'approved' ? 'Audit Satisfied' : 'Pending Milestone'}
                    </span>
                  </div>

                  {stage.notes && (
                    <div className="sm:col-span-2 lg:col-span-4 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200 text-amber-950 text-xs flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{stage.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
