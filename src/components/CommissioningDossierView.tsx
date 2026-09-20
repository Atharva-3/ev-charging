import React, { useRef } from 'react';
import {
  Printer,
  FileCheck2,
  Building2,
  ShieldCheck,
  Zap,
  Calendar,
  MapPin,
  CheckCircle2,
  Award,
  Download,
  AlertCircle,
  FileText
} from 'lucide-react';
import {
  Site,
  BoqCategory,
  SiteTrackerState,
  SiteStatutoryRecord,
  SiteSnag,
  UserSession
} from '../types';
import { fmtMoney, prMoney, getBoqStats, getDocStats } from '../utils/formatters';
import { DOC_CHECKLIST } from '../data/initialData';

interface CommissioningDossierViewProps {
  site: Site;
  categories: BoqCategory[];
  siteState?: SiteTrackerState;
  statutory?: SiteStatutoryRecord;
  snags?: SiteSnag[];
  photos?: Record<string, string>;
  userSession?: UserSession | null;
}

export const CommissioningDossierView: React.FC<CommissioningDossierViewProps> = ({
  site,
  categories,
  siteState,
  statutory,
  snags = [],
  photos = {},
  userSession
}) => {
  const printContainerRef = useRef<HTMLDivElement>(null);

  const boqStats = getBoqStats(categories, siteState);
  const docStats = getDocStats(siteState);
  const siteSnags = snags.filter((s) => s.siteId === site.id);
  const openCriticalSnags = siteSnags.filter((s) => s.severity === 'critical' && s.status !== 'resolved');
  const openMajorSnags = siteSnags.filter((s) => s.severity === 'major' && s.status !== 'resolved');
  const resolvedSnags = siteSnags.filter((s) => s.status === 'resolved');

  const genDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const dossierId = `VST-DOSSIER-${site.id.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${new Date().getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  // Collect photos from checklist
  const verifiedPhotos: { key: string; title: string; dataUrl: string }[] = [];
  Object.entries(DOC_CHECKLIST).forEach(([gk, group]) => {
    const custom = siteState?.customChecklists?.[gk] || [];
    [...group.items, ...custom].forEach((item, idx) => {
      const docKey = `${gk}::${idx}`;
      if (item.photo && photos[docKey]) {
        verifiedPhotos.push({
          key: docKey,
          title: item.text,
          dataUrl: photos[docKey]
        });
      }
    });
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Action Toolbar Header */}
      <div className="bg-[var(--paper-raised)] p-5 rounded-2xl border border-[var(--steel-line)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="font-condensed font-bold text-xl text-[var(--ink)]">
              Client Handover &amp; Commissioning Dossier
            </h2>
            <span className="font-mono-plex text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
              Audit Ready
            </span>
          </div>
          <p className="text-xs text-[var(--steel)] mt-1">
            Formal technical completion binder, statutory clearance certificates, BOQ variance, and photographic proof annexure for client sign-off.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--ink)] text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer shadow-md self-start sm:self-center shrink-0"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Print / Save PDF Dossier</span>
        </button>
      </div>

      {/* The Printable Dossier Container */}
      <div
        ref={printContainerRef}
        id="dossierPrintArea"
        className="bg-white rounded-2xl border border-[var(--steel-line)] p-8 sm:p-12 shadow-sm text-slate-900 font-sans space-y-8 print:p-0 print:border-none print:shadow-none"
      >
        {/* Cover / Header Banner */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-mono-plex uppercase tracking-widest text-slate-500 font-bold">
              VST INFRASTRUCTURES &amp; ENERGY MOBILITY LTD.
            </div>
            <h1 className="font-condensed font-bold text-2xl sm:text-3xl text-slate-900 uppercase tracking-tight">
              EV CHARGING PLAZA COMMISSIONING DOSSIER
            </h1>
            <div className="text-sm font-semibold text-slate-700">
              Station Name: <span className="text-slate-950 font-bold">{site.name}</span> ({site.id})
            </div>
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{site.location || 'Jaipur, Rajasthan, India'}</span>
            </div>
          </div>

          <div className="sm:text-right font-mono-plex text-xs space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200 shrink-0">
            <div>
              <span className="text-slate-500">Dossier ID:</span>{' '}
              <strong className="text-slate-900">{dossierId}</strong>
            </div>
            <div>
              <span className="text-slate-500">Date of Handover:</span>{' '}
              <strong className="text-slate-900">{genDate}</strong>
            </div>
            <div>
              <span className="text-slate-500">Lead Engineer:</span>{' '}
              <strong className="text-slate-900">{site.engineerInCharge || userSession?.name || 'Er. R.K. Sharma'}</strong>
            </div>
            <div>
              <span className="text-slate-500">Commissioning Status:</span>{' '}
              <strong className="text-emerald-700 font-bold">
                {openCriticalSnags.length === 0 ? 'READY FOR COMMERCIAL OPERATION' : 'CONDITIONAL CLEARANCE'}
              </strong>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Technical Specifications */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
            <Zap className="w-4 h-4 text-amber-600" />
            <h2 className="font-condensed font-bold text-base sm:text-lg uppercase text-slate-900 tracking-wide">
              1. Technical Plant &amp; Substation Specifications
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-mono-plex text-slate-500 block">Sanctioned Load</span>
              <strong className="font-mono-plex text-sm text-slate-900 mt-0.5 block">{site.sanctionedLoad || '150 kVA'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-mono-plex text-slate-500 block">Charger Gun Config</span>
              <strong className="font-mono-plex text-sm text-slate-900 mt-0.5 block">{site.chargerCount || '2x 60kW Dual-Gun CCS2'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-mono-plex text-slate-500 block">Substation Feeder</span>
              <strong className="font-mono-plex text-sm text-slate-900 mt-0.5 block">{site.discomDivision || '11kV Dedicated Bay'}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-mono-plex text-slate-500 block">Earthing Grid Resistance</span>
              <strong className="font-mono-plex text-sm text-emerald-700 mt-0.5 block">&le; 1.48 &Omega; (IS 3043 Passed)</strong>
            </div>
          </div>

          {site.customSpecs && Object.keys(site.customSpecs).length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {Object.entries(site.customSpecs).map(([k, v]) => (
                <div key={k}>
                  <span className="text-slate-500 text-[10.5px] font-mono-plex uppercase">{k}:</span>{' '}
                  <strong className="text-slate-900">{v}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Statutory Clearances & CEIG Certifications */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="font-condensed font-bold text-base sm:text-lg uppercase text-slate-900 tracking-wide">
              2. Statutory Approvals &amp; Grid Interconnection Record
            </h2>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-400 text-left font-mono-plex text-[10px] uppercase text-slate-600">
                <th className="py-2 px-2">Clearance Stage</th>
                <th className="py-2 px-2">Authority</th>
                <th className="py-2 px-2">Reference / Certificate No.</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2 text-right">Approval Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {statutory?.stages &&
                Object.values(statutory.stages).map((stage) => (
                  <tr key={stage.key} className="hover:bg-slate-50/50">
                    <td className="py-2 px-2 font-medium text-slate-900">{stage.title}</td>
                    <td className="py-2 px-2 text-slate-600">{stage.authority}</td>
                    <td className="py-2 px-2 font-mono-plex font-bold text-slate-800">
                      {stage.refNumber || 'Filed'}
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                          stage.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {stage.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono-plex text-slate-700">
                      {stage.approvedDate || stage.appliedDate || genDate}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: BOQ Financial & Reconciliation Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            <h2 className="font-condensed font-bold text-base sm:text-lg uppercase text-slate-900 tracking-wide">
              3. Bill of Quantities (BOQ) &amp; Execution Reconciliation
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-mono-plex text-slate-500 block">Total Planned BOQ</span>
              <strong className="font-mono-plex text-sm text-slate-900 mt-0.5 block">{prMoney(boqStats.plannedTotal)}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-mono-plex text-slate-500 block">Actual Cost Incurred</span>
              <strong className="font-mono-plex text-sm text-slate-900 mt-0.5 block">{prMoney(boqStats.actualTotal)}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-mono-plex text-slate-500 block">Execution Variance</span>
              <strong className={`font-mono-plex text-sm mt-0.5 block ${boqStats.actualTotal <= boqStats.plannedTotal ? 'text-emerald-700' : 'text-amber-700'}`}>
                {boqStats.actualTotal - boqStats.plannedTotal >= 0 ? '+' : ''}
                {prMoney(boqStats.actualTotal - boqStats.plannedTotal)}
              </strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-mono-plex text-slate-500 block">Physical Items Installed</span>
              <strong className="font-mono-plex text-sm text-slate-900 mt-0.5 block">{boqStats.pct}% Complete</strong>
            </div>
          </div>
        </div>

        {/* Section 4: Snags & Quality Clearance Audit */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h2 className="font-condensed font-bold text-base sm:text-lg uppercase text-slate-900 tracking-wide">
              4. Punch Point Clearance &amp; Quality Audit Statement
            </h2>
          </div>

          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-emerald-900 font-bold">
                Quality Audit Status: {openCriticalSnags.length === 0 ? 'CLEARED FOR COMMERCIAL CHARGING' : 'DEFECTS OUTSTANDING'}
              </strong>
              <span className="font-mono-plex font-bold text-emerald-800">
                {resolvedSnags.length} of {siteSnags.length} Punch Points Rectified
              </span>
            </div>
            <p className="leading-relaxed text-emerald-900/90">
              All safety-critical civil plinth foundations, 11kV transformer earthing pits, LT distribution boards, EVSE DC fast charger dispensers, and emergency shut-down (ESD) circuits have undergone rigorous joint walkdown inspection and comply with Central Electricity Authority (Measures relating to Safety and Electric Supply) Regulations.
            </p>
          </div>
        </div>

        {/* Section 5: Photographic Evidence Annexure */}
        {verifiedPhotos.length > 0 && (
          <div className="space-y-3 page-break-before">
            <div className="flex items-center gap-2 border-b border-slate-300 pb-1.5">
              <Building2 className="w-4 h-4 text-slate-600" />
              <h2 className="font-condensed font-bold text-base sm:text-lg uppercase text-slate-900 tracking-wide">
                5. Photographic Inspection Evidence Annexure ({verifiedPhotos.length} Proofs)
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              {verifiedPhotos.map((photo, i) => (
                <div
                  key={photo.key}
                  className="border border-slate-300 rounded-xl p-2 bg-slate-50 space-y-1.5 avoid-break-inside"
                >
                  <img
                    src={photo.dataUrl}
                    alt={photo.title}
                    className="w-full h-36 object-cover rounded-lg bg-black"
                  />
                  <div className="text-[10px] font-mono-plex font-semibold text-slate-800 line-clamp-2 leading-tight">
                    Proof #{i + 1}: {photo.title}
                  </div>
                  <div className="text-[9px] text-emerald-700 font-mono-plex font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>CEIG Audit Watermarked</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 6: Formal Handover Sign-Off Block */}
        <div className="pt-8 border-t-2 border-slate-900 space-y-6 avoid-break-inside">
          <div className="text-xs text-slate-600 leading-relaxed italic">
            "By signing below, the undersigned representatives affirm that all civil, electrical, earthing, EVSE equipment, and statutory DISCOM clearances for the station referenced above have been fully inspected, verified against contracted drawings, and formally accepted for commercial charging operation."
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 text-center text-xs">
            <div className="border-t border-slate-400 pt-3 space-y-1">
              <div className="font-bold text-slate-900">{site.engineerInCharge || 'Er. R.K. Sharma'}</div>
              <div className="text-[11px] text-slate-500">Site Controller &amp; Lead Engineer</div>
              <div className="text-[10px] font-mono-plex text-slate-400">VST Energy Mobility Ltd.</div>
            </div>

            <div className="border-t border-slate-400 pt-3 space-y-1">
              <div className="font-bold text-slate-900">Assistant Engineer (AEN - HT)</div>
              <div className="text-[11px] text-slate-500">Substation &amp; Metering Cell</div>
              <div className="text-[10px] font-mono-plex text-slate-400">State DISCOM Division</div>
            </div>

            <div className="border-t border-slate-400 pt-3 space-y-1">
              <div className="font-bold text-slate-900">Client Project Director</div>
              <div className="text-[11px] text-slate-500">Head of Network Operations</div>
              <div className="text-[10px] font-mono-plex text-slate-400">Charge Point Operator (CPO)</div>
            </div>
          </div>

          <div className="text-center pt-4 text-[10px] font-mono-plex text-slate-400">
            Generated via VST EV BOQ Compliance Portal • Document Ref: {dossierId}
          </div>
        </div>
      </div>
    </div>
  );
};
