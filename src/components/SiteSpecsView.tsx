import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit2,
  Calendar,
  User,
  Sliders,
  FileText
} from 'lucide-react';
import { Site, SiteRequirement, SiteLogEntry } from '../types';

interface SiteSpecsViewProps {
  site: Site;
  userRole?: 'manager' | 'worker';
  onUpdateSite: (updatedSite: Site) => void;
}

export const SiteSpecsView: React.FC<SiteSpecsViewProps> = ({ site, userRole = 'manager', onUpdateSite }) => {
  const isManager = userRole === 'manager';
  const isWorker = userRole === 'worker';
  // Specs state
  const [isAddingSpec, setIsAddingSpec] = useState(false);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  // Requirement state
  const [isAddingReq, setIsAddingReq] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqCat, setReqCat] = useState('Electrical');
  const [reqPriority, setReqPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [reqDueDate, setReqDueDate] = useState('');
  const [reqNotes, setReqNotes] = useState('');

  // Log state
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [logAuthor, setLogAuthor] = useState(site.engineerInCharge || 'Site Engineer');
  const [logText, setLogText] = useState('');

  // --- Specifications Handlers ---
  const handleSaveSpec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;

    const updatedSpecs = {
      ...(site.customSpecs || {}),
      [newSpecKey.trim()]: newSpecVal.trim()
    };

    onUpdateSite({
      ...site,
      customSpecs: updatedSpecs
    });

    setNewSpecKey('');
    setNewSpecVal('');
    setIsAddingSpec(false);
  };

  const handleDeleteSpec = (key: string) => {
    const updatedSpecs = { ...(site.customSpecs || {}) };
    delete updatedSpecs[key];
    onUpdateSite({
      ...site,
      customSpecs: updatedSpecs
    });
  };

  // --- Requirements Handlers ---
  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;

    const newReq: SiteRequirement = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: reqTitle.trim(),
      category: reqCat,
      priority: reqPriority,
      status: 'pending',
      dueDate: reqDueDate || undefined,
      notes: reqNotes.trim() || undefined
    };

    const updatedReqs = [...(site.extraRequirements || []), newReq];
    onUpdateSite({
      ...site,
      extraRequirements: updatedReqs
    });

    setReqTitle('');
    setReqNotes('');
    setReqDueDate('');
    setIsAddingReq(false);
  };

  const handleUpdateReqStatus = (reqId: string, status: SiteRequirement['status']) => {
    const updatedReqs = (site.extraRequirements || []).map((r) =>
      r.id === reqId ? { ...r, status } : r
    );
    onUpdateSite({
      ...site,
      extraRequirements: updatedReqs
    });
  };

  const handleDeleteReq = (reqId: string) => {
    const updatedReqs = (site.extraRequirements || []).filter((r) => r.id !== reqId);
    onUpdateSite({
      ...site,
      extraRequirements: updatedReqs
    });
  };

  // --- Logs Handlers ---
  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logText.trim()) return;

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newLog: SiteLogEntry = {
      id: `log_${Date.now()}`,
      date: nowStr,
      author: logAuthor.trim() || 'Site In-Charge',
      text: logText.trim()
    };

    const updatedLogs = [newLog, ...(site.logs || [])];
    onUpdateSite({
      ...site,
      logs: updatedLogs
    });

    setLogText('');
    setIsAddingLog(false);
  };

  const handleDeleteLog = (logId: string) => {
    const updatedLogs = (site.logs || []).filter((l) => l.id !== logId);
    onUpdateSite({
      ...site,
      logs: updatedLogs
    });
  };

  const customSpecs = site.customSpecs || {};
  const extraRequirements = site.extraRequirements || [];
  const logs = site.logs || [];

  return (
    <div className="space-y-6 pb-6">
      {/* 1. Technical Specifications Grid */}
      <div className="border border-[var(--steel-line)] rounded-lg bg-[var(--paper-raised)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--steel-line)] bg-black/[0.015]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--ink)]" />
            <h3 className="font-condensed font-bold text-base sm:text-lg text-[var(--ink)]">
              Site Technical Specifications &amp; Parameters
            </h3>
          </div>
          {isManager && (
            <button
              onClick={() => setIsAddingSpec(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--steel-line)] bg-white text-xs font-medium text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Spec</span>
            </button>
          )}
        </div>

        <div className="p-4">
          {Object.keys(customSpecs).length === 0 && !isAddingSpec ? (
            <div className="text-center py-6 text-xs text-[var(--steel)]">
              No custom specifications configured for this site yet. Click &quot;Add Spec&quot; to specify transformer, DISCOM parameters, or custom equipment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(customSpecs).map(([key, val]) => (
                <div
                  key={key}
                  className="p-3 bg-white border border-[var(--steel-line)] rounded-md flex flex-col justify-between relative group"
                >
                  <div>
                    <div className="text-[11px] font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                      {key}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-[var(--ink)] break-words">
                      {val}
                    </div>
                  </div>
                  {isManager && (
                    <button
                      onClick={() => handleDeleteSpec(key)}
                      className="absolute top-2.5 right-2.5 text-[var(--steel)] hover:text-[var(--rust)] opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
                      title="Remove specification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {isAddingSpec && (
            <form
              onSubmit={handleSaveSpec}
              className="mt-3 p-3 bg-white border border-[var(--steel-line)] rounded-md space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                    Parameter / Specification Name
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder="e.g. Earth Pit Resistance Target, Transformer Rating, CT Ratio..."
                    className="w-full px-2.5 py-1.5 border border-[var(--steel-line)] rounded text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                    Value / Rating / Requirement
                  </label>
                  <input
                    type="text"
                    required
                    value={newSpecVal}
                    onChange={(e) => setNewSpecVal(e.target.value)}
                    placeholder="e.g. < 0.8 Ohm, 250 kVA Level-2, 630A FP MCCB..."
                    className="w-full px-2.5 py-1.5 border border-[var(--steel-line)] rounded text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSpec(false)}
                  className="px-2.5 py-1 text-xs text-[var(--steel)] hover:text-[var(--ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-[var(--ink)] text-white text-xs font-semibold rounded hover:bg-[#132029]"
                >
                  Save Specification
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 2. Site-Specific Extra Requirements List */}
      <div className="border border-[var(--steel-line)] rounded-lg bg-[var(--paper-raised)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--steel-line)] bg-black/[0.015]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--ink)]" />
            <h3 className="font-condensed font-bold text-base sm:text-lg text-[var(--ink)]">
              Site Requirements &amp; Action Items ({extraRequirements.length})
            </h3>
          </div>
          <button
            onClick={() => setIsAddingReq(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--steel-line)] bg-white text-xs font-medium text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Requirement</span>
          </button>
        </div>

        {isAddingReq && (
          <form
            onSubmit={handleAddRequirement}
            className="p-4 border-b border-[var(--steel-line)] bg-white space-y-3"
          >
            <h4 className="text-xs font-semibold text-[var(--ink)] uppercase tracking-wider">
              New Site Requirement / Action Item
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                  Requirement Title *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="e.g. Obtain DISCOM 11kV Feeder Shutdown Permission..."
                  className="w-full px-2.5 py-1.5 border border-[var(--steel-line)] rounded text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                  Category
                </label>
                <select
                  value={reqCat}
                  onChange={(e) => setReqCat(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[var(--steel-line)] rounded text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                >
                  <option value="Electrical">Electrical I&amp;C</option>
                  <option value="Civil">Civil &amp; Foundations</option>
                  <option value="DISCOM">DISCOM &amp; Liaisoning</option>
                  <option value="Municipal">Municipal / Highway NOC</option>
                  <option value="Safety">Safety &amp; Earthing</option>
                  <option value="Vendor">Vendor &amp; Charger Hardware</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                  Priority
                </label>
                <select
                  value={reqPriority}
                  onChange={(e) => setReqPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full px-2.5 py-1.5 border border-[var(--steel-line)] rounded text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={reqDueDate}
                  onChange={(e) => setReqDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[var(--steel-line)] rounded text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                  Notes / Reference
                </label>
                <input
                  type="text"
                  value={reqNotes}
                  onChange={(e) => setReqNotes(e.target.value)}
                  placeholder="e.g. Challan #9842 submitted to AEN office"
                  className="w-full px-2.5 py-1.5 border border-[var(--steel-line)] rounded text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingReq(false)}
                className="px-2.5 py-1 text-xs text-[var(--steel)] hover:text-[var(--ink)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-[var(--ink)] text-white text-xs font-semibold rounded hover:bg-[#132029]"
              >
                Add Requirement
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-[var(--steel-line)]">
          {extraRequirements.length === 0 ? (
            <div className="text-center py-6 text-xs text-[var(--steel)]">
              No extra site requirements recorded. Add any site-specific municipal permissions, contractor scopes, or technical checks above.
            </div>
          ) : (
            extraRequirements.map((req) => {
              const priorityStyles = {
                high: 'bg-red-50 text-red-700 border-red-200',
                medium: 'bg-amber-50 text-amber-700 border-amber-200',
                low: 'bg-blue-50 text-blue-700 border-blue-200'
              };

              return (
                <div
                  key={req.id}
                  className="p-3.5 hover:bg-black/[0.01] transition-colors flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-[240px] flex-1">
                    <div className="pt-0.5">
                      {req.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--green)]" />
                      ) : req.status === 'in-progress' ? (
                        <Clock className="w-4 h-4 text-[var(--amber)]" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-[var(--steel)]" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span
                          className={`text-xs font-semibold ${
                            req.status === 'completed'
                              ? 'line-through text-[var(--steel)]'
                              : 'text-[var(--ink)]'
                          }`}
                        >
                          {req.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--paper)] border border-[var(--steel-line)] text-[var(--steel)] uppercase">
                          {req.category}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-semibold ${
                            priorityStyles[req.priority]
                          }`}
                        >
                          {req.priority}
                        </span>
                      </div>
                      {req.notes && (
                        <p className="text-[11px] text-[var(--steel)] leading-relaxed">
                          {req.notes}
                        </p>
                      )}
                      {req.dueDate && (
                        <div className="flex items-center gap-1 text-[11px] text-[var(--steel)] mt-1 font-mono-plex">
                          <Calendar className="w-3 h-3 text-[var(--rust)]" />
                          <span>Due: {req.dueDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={req.status}
                      onChange={(e) =>
                        handleUpdateReqStatus(req.id, e.target.value as SiteRequirement['status'])
                      }
                      className="text-xs px-2 py-1 rounded border border-[var(--steel-line)] bg-white text-[var(--ink)] cursor-pointer focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => handleDeleteReq(req.id)}
                      className="text-[var(--steel)] hover:text-[var(--rust)] p-1 cursor-pointer transition-colors"
                      title="Delete requirement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Engineering Visit & Site Activity Log */}
      <div className="border border-[var(--steel-line)] rounded-lg bg-[var(--paper-raised)] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--steel-line)] bg-black/[0.015]">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--ink)]" />
            <h3 className="font-condensed font-bold text-base sm:text-lg text-[var(--ink)]">
              Engineering Field Notes &amp; Activity Log
            </h3>
          </div>
          <button
            onClick={() => setIsAddingLog(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[var(--steel-line)] bg-white text-xs font-medium text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Log Entry</span>
          </button>
        </div>

        {isAddingLog && (
          <form
            onSubmit={handleAddLog}
            className="p-4 border-b border-[var(--steel-line)] bg-white space-y-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                  Author / Engineer Name
                </label>
                <input
                  type="text"
                  required
                  value={logAuthor}
                  onChange={(e) => setLogAuthor(e.target.value)}
                  placeholder="e.g. Er. Rakesh Sharma"
                  className="w-full px-2.5 py-1.5 border border-[var(--steel-line)] rounded text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[var(--steel)] uppercase mb-1">
                  Observation / Visit Details *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  placeholder="e.g. Cable trenching complete from DP pole to ACDB room. Megger testing completed."
                  className="w-full px-2.5 py-1.5 border border-[var(--steel-line)] rounded text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingLog(false)}
                className="px-2.5 py-1 text-xs text-[var(--steel)] hover:text-[var(--ink)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-[var(--ink)] text-white text-xs font-semibold rounded hover:bg-[#132029]"
              >
                Record Entry
              </button>
            </div>
          </form>
        )}

        <div className="divide-y divide-[var(--steel-line)]">
          {logs.length === 0 ? (
            <div className="text-center py-6 text-xs text-[var(--steel)]">
              No field notes recorded yet. Record daily site progress, DISCOM engineer inspections, or testing results here.
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 hover:bg-black/[0.01] transition-colors flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-[var(--ink)]">{log.author}</span>
                    <span className="text-[var(--steel)] text-[11px] font-mono-plex">{log.date}</span>
                  </div>
                  <p className="text-xs text-[var(--ink)] leading-relaxed">{log.text}</p>
                </div>
                <button
                  onClick={() => handleDeleteLog(log.id)}
                  className="text-[var(--steel)] hover:text-[var(--rust)] p-1 cursor-pointer transition-colors"
                  title="Remove log entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
