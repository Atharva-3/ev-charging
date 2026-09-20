import React, { useRef } from 'react';
import { Download, Upload, Printer, LayoutGrid, Building2, LogOut, ShieldCheck, HardHat, User, QrCode, Activity, AlertTriangle } from 'lucide-react';
import { ExportPayload, UserSession, SiteHealthAssessment } from '../types';

interface HeaderProps {
  pageMode?: 'directory' | 'site';
  userSession: UserSession | null;
  healthAssessment?: SiteHealthAssessment;
  onOpenAlerts?: () => void;
  onOpenQrPlacard?: () => void;
  onNavigateDirectory?: () => void;
  onExport: () => void;
  onImport: (payload: ExportPayload) => void;
  onPrint: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageMode = 'site',
  userSession,
  healthAssessment,
  onOpenAlerts,
  onOpenQrPlacard,
  onNavigateDirectory,
  onExport,
  onImport,
  onPrint,
  onLogout
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onImport(parsed);
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const isManager = userSession?.role === 'manager';

  return (
    <header className="px-6 py-4 border-b border-[var(--steel-line)] flex flex-wrap justify-between items-center gap-4 bg-[var(--paper)]">
      <div className="flex items-center gap-3">
        {onNavigateDirectory && (
          <button
            onClick={onNavigateDirectory}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              pageMode === 'directory'
                ? 'bg-[var(--ink)] text-[var(--paper-raised)] border-[var(--ink)]'
                : 'bg-white text-[var(--ink)] border-[var(--steel-line)] hover:border-[var(--ink)]'
            }`}
            title="View all sites portfolio"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Sites Portfolio</span>
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-condensed font-bold text-xl sm:text-2xl text-[var(--ink)] tracking-tight leading-none">
              VST BOQ &amp; Multi-Site Infrastructure Tracker
            </h1>
          </div>
          <p className="text-[var(--steel)] text-xs mt-0.5">
            Site-specific BOQs, DISCOM approvals, geotagged photo compliance &amp; variance tracking
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* User Role Badge & Switch Button */}
        {userSession && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--steel-line)] bg-white shadow-2xs">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                isManager ? 'bg-[var(--ink)]' : 'bg-[var(--rust)]'
              }`}
            >
              {isManager ? <ShieldCheck className="w-3.5 h-3.5" /> : <HardHat className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-[var(--ink)] leading-none">
                  {userSession.name}
                </span>
                <span
                  className={`text-[9.5px] font-mono-plex px-1.5 py-0.2 rounded font-bold uppercase ${
                    isManager
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {isManager ? 'Controller' : 'Field Worker'}
                </span>
              </div>
              <div className="text-[10.5px] text-[var(--steel)] leading-none mt-0.5">
                {userSession.designation}
              </div>
            </div>

            <button
              onClick={onLogout}
              className="ml-2 pl-2 border-l border-[var(--steel-line)] text-xs text-[var(--steel)] hover:text-[var(--rust)] transition-colors inline-flex items-center gap-1 cursor-pointer font-medium"
              title="Switch role or logout"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden sm:inline">Switch Role</span>
            </button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          className="hidden"
        />

        {/* Critical Health Index & Delay Alerts Pill */}
        {healthAssessment && onOpenAlerts && (
          <button
            onClick={onOpenAlerts}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer shadow-2xs transition-all ${
              healthAssessment.status === 'delayed'
                ? 'bg-red-50 text-red-900 border-red-300 hover:bg-red-100'
                : healthAssessment.status === 'minor-risk'
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
            }`}
            title="View Site Health & Critical Milestone Delay Predictor"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Health {healthAssessment.healthScore}%</span>
            {healthAssessment.alerts.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
          </button>
        )}

        {/* Weatherproof Site QR Board Button */}
        {onOpenQrPlacard && (
          <button
            onClick={onOpenQrPlacard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--steel-line)] text-xs font-medium text-[var(--ink)] bg-white hover:border-[var(--ink)] transition-colors cursor-pointer shadow-2xs"
            title="Generate & Print Weatherproof Site Board with QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-[var(--rust)]" />
            <span className="hidden sm:inline">Site QR Board</span>
          </button>
        )}

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium shadow-2xs" title="Connected to Google Cloud Firestore database with real-time field synchronization">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="font-mono-plex font-semibold text-[10.5px]">Cloud DB Live</span>
        </div>

        {isManager && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--steel-line)] text-xs font-medium text-[var(--steel)] bg-[var(--paper-raised)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer"
              title="Import backup JSON"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>

            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--steel-line)] text-xs font-medium text-[var(--steel)] bg-[var(--paper-raised)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer"
              title="Export data as JSON backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export data</span>
            </button>
          </>
        )}

        <button
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--steel-line)] text-xs font-medium text-[var(--steel)] bg-[var(--paper-raised)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer"
          title="Print official site report"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print report</span>
        </button>
      </div>
    </header>
  );
};
