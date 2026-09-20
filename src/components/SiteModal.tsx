import React, { useState, useEffect } from 'react';
import { Site } from '../types';

interface SiteModalProps {
  isOpen: boolean;
  site: Site | null; // if editing existing
  existingSites?: Site[];
  onClose: () => void;
  onSave: (siteData: Partial<Site>, templateChoice?: string) => void;
}

export const SiteModal: React.FC<SiteModalProps> = ({
  isOpen,
  site,
  existingSites = [],
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [sanctionedLoad, setSanctionedLoad] = useState('120 kW');
  const [chargerCount, setChargerCount] = useState('1x 60kW DC CCS2 Dual Gun + 1x 22kW AC');
  const [discomDivision, setDiscomDivision] = useState('');
  const [engineerInCharge, setEngineerInCharge] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<Site['status']>('Planning');
  const [templateChoice, setTemplateChoice] = useState('standard');

  useEffect(() => {
    if (site) {
      setName(site.name || '');
      setLocation(site.location || '');
      setSanctionedLoad(site.sanctionedLoad || '120 kW');
      setChargerCount(site.chargerCount || '1x 60kW DC CCS2 Dual Gun + 1x 22kW AC');
      setDiscomDivision(site.discomDivision || '');
      setEngineerInCharge(site.engineerInCharge || '');
      setTargetDate(site.targetDate || '');
      setStatus(site.status || 'Planning');
    } else {
      setName('');
      setLocation('');
      setSanctionedLoad('120 kW');
      setChargerCount('1x 60kW DC CCS2 Dual Gun + 1x 22kW AC');
      setDiscomDivision('DISCOM Sub-Division');
      setEngineerInCharge('');
      setTargetDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
      setStatus('Planning');
      setTemplateChoice('standard');
    }
  }, [site, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(
      {
        name: name.trim(),
        location: location.trim(),
        sanctionedLoad: sanctionedLoad.trim(),
        chargerCount: chargerCount.trim(),
        discomDivision: discomDivision.trim(),
        engineerInCharge: engineerInCharge.trim(),
        targetDate: targetDate.trim(),
        status
      },
      templateChoice
    );
  };

  return (
    <div
      className="fixed inset-0 bg-[#14191d]/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[var(--paper)] rounded-xl p-6 w-full max-w-lg border border-[var(--steel-line)] shadow-2xl my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--steel-line)]">
          <div>
            <h3 className="font-condensed font-bold text-2xl text-[var(--ink)]">
              {site ? 'Edit Site Configuration' : 'Create New Site'}
            </h3>
            <p className="text-xs text-[var(--steel)]">
              {site
                ? 'Update site parameters, DISCOM connection & load'
                : 'Initialize an individual site workspace with customized BOQ'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--steel)] hover:text-[var(--ink)] text-xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                Site Name *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. VST Sitapura Industrial Hub"
                className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-md text-sm text-[var(--ink)] placeholder:text-[var(--steel)]/60 focus:outline-none focus:border-[var(--ink)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                Site Location / Address (or Lat, Long)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. RIICO Industrial Area, Sitapura, Jaipur, RJ or 26.7762,75.8451"
                className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-md text-sm text-[var(--ink)] placeholder:text-[var(--steel)]/60 focus:outline-none focus:border-[var(--ink)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                Sanctioned Load
              </label>
              <select
                value={sanctionedLoad}
                onChange={(e) => setSanctionedLoad(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-md text-xs font-medium text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] cursor-pointer"
              >
                <option value="120 kW">120 kW (HT/LT Commercial)</option>
                <option value="90 kW">90 kW (Standard DC Fast)</option>
                <option value="60 kW">60 kW (DC Dual Gun)</option>
                <option value="30 kW">30 kW (Light Fleet / AC)</option>
                <option value="150 kW">150 kW (Ultra-Fast Hub)</option>
                <option value="250 kW+">250 kW+ (Heavy Fleet Hub)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                Project Stage / Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Site['status'])}
                className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-md text-xs font-medium text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] cursor-pointer"
              >
                <option value="Planning">Planning & Survey</option>
                <option value="Civil Work">Civil Work & Foundations</option>
                <option value="Electrical I&C">Electrical I&C</option>
                <option value="Testing & Approvals">Testing & Approvals</option>
                <option value="Commissioned">Commissioned & Active</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                EV Chargers Setup
              </label>
              <input
                type="text"
                value={chargerCount}
                onChange={(e) => setChargerCount(e.target.value)}
                placeholder="e.g. 1x 60kW DC + 1x 22kW AC"
                className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-md text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                DISCOM Sub-Division
              </label>
              <input
                type="text"
                value={discomDivision}
                onChange={(e) => setDiscomDivision(e.target.value)}
                placeholder="e.g. JVVNL / RIICO Sitapura Sub-Division"
                className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-md text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                Site Engineer / In-Charge
              </label>
              <input
                type="text"
                value={engineerInCharge}
                onChange={(e) => setEngineerInCharge(e.target.value)}
                placeholder="e.g. Er. Vikram Choudhary"
                className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-md text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                Target Commissioning Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-md text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
              />
            </div>
          </div>

          {!site && (
            <div className="p-3 bg-[var(--paper-raised)] border border-[var(--steel-line)] rounded-lg">
              <label className="block text-xs font-semibold text-[var(--ink)] uppercase tracking-wider mb-1">
                Initial BOQ Template for this Site
              </label>
              <p className="text-[11px] text-[var(--steel)] mb-2">
                You can customize, add, or remove categories and items as per this site&apos;s requirements once created.
              </p>
              <select
                value={templateChoice}
                onChange={(e) => setTemplateChoice(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[var(--steel-line)] rounded-md text-xs font-medium text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] cursor-pointer"
              >
                <option value="standard">Standard 17-Category EV Charging Template (VST Reference)</option>
                {existingSites.map((s) => (
                  <option key={s.id} value={`clone:${s.id}`}>
                    Clone current BOQ from &quot;{s.name}&quot;
                  </option>
                ))}
                <option value="blank">Blank Custom BOQ (Build categories from scratch)</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--steel-line)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-[var(--steel)] hover:text-[var(--ink)] rounded-md cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--ink)] text-[var(--paper-raised)] text-xs font-semibold rounded-md hover:bg-[#132029] transition-colors cursor-pointer shadow-xs"
            >
              {site ? 'Save Changes' : 'Create Site Page →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
