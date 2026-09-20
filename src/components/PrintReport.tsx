import React from 'react';
import { Site, BoqCategory, SiteTrackerState } from '../types';
import { DOC_CHECKLIST } from '../data/initialData';
import { fmtMoney, prMoney, getBoqStats, getCatStats, getDocStats, itemKey, getDefaultItemState } from '../utils/formatters';

interface PrintReportProps {
  sites: Site[];
  customBoqs: Record<string, BoqCategory[]>;
  allState: Record<string, SiteTrackerState>;
  getCategories: (siteId: string) => BoqCategory[];
}

export const PrintReport: React.FC<PrintReportProps> = ({
  sites,
  allState,
  getCategories
}) => {
  const genDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="hidden print-only text-black p-4 bg-white" id="printReport">
      <div className="border-b-2 border-black pb-3 mb-6">
        <h1 className="font-condensed font-bold text-3xl tracking-tight uppercase">
          VST BOQ &amp; Compliance Report
        </h1>
        <p className="text-xs text-gray-600 mt-1">Generated {genDate}</p>
      </div>

      {sites.map((site) => {
        const cats = getCategories(site.id);
        const sState = allState[site.id];
        const bStats = getBoqStats(cats, sState);
        const dStats = getDocStats(sState);
        const variance = bStats.actualTotal - bStats.plannedTotal;

        return (
          <div key={site.id} className="page-break-after mb-8">
            <div className="border-b border-gray-400 pb-2 mb-4">
              <h2 className="font-condensed font-bold text-2xl uppercase">{site.name}</h2>
              <div className="text-xs text-gray-600">
                {site.location ? site.location : 'No location set'}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-5 gap-3 text-xs mb-6 avoid-break-inside">
              <div className="border border-gray-300 p-2.5 rounded">
                <span className="text-gray-500 block text-[10px] uppercase">BOQ Progress</span>
                <strong className="text-sm font-mono-plex">{bStats.pct}%</strong>
              </div>
              <div className="border border-gray-300 p-2.5 rounded">
                <span className="text-gray-500 block text-[10px] uppercase">Planned Value</span>
                <strong className="text-sm font-mono-plex">{prMoney(bStats.plannedTotal)}</strong>
              </div>
              <div className="border border-gray-300 p-2.5 rounded">
                <span className="text-gray-500 block text-[10px] uppercase">Actual Cost</span>
                <strong className="text-sm font-mono-plex">{prMoney(bStats.actualTotal)}</strong>
              </div>
              <div className="border border-gray-300 p-2.5 rounded">
                <span className="text-gray-500 block text-[10px] uppercase">Variance</span>
                <strong className="text-sm font-mono-plex">
                  {variance >= 0 ? '+' : ''}
                  {prMoney(variance)}
                </strong>
              </div>
              <div className="border border-gray-300 p-2.5 rounded">
                <span className="text-gray-500 block text-[10px] uppercase">Docs Complete</span>
                <strong className="text-sm font-mono-plex">
                  {dStats.checked} / {dStats.total}
                </strong>
              </div>
            </div>

            {/* Category Tables */}
            <div className="space-y-5">
              {cats.map((cat) => {
                const cs = getCatStats(cat, sState);

                return (
                  <div key={cat.num} className="avoid-break-inside">
                    <div className="font-bold text-xs uppercase tracking-wide border-b border-gray-800 pb-1 mb-1.5 flex justify-between">
                      <span>
                        {String(cat.num).padStart(2, '0')}. {cat.name}
                      </span>
                      <span className="font-mono-plex font-normal text-gray-700">
                        Planned {prMoney(cs.plannedTotal)} | Actual {prMoney(cs.actualTotal)}
                      </span>
                    </div>

                    <table className="w-full border-collapse text-[10px] mb-3">
                      <thead>
                        <tr className="border-b border-gray-400 text-left text-gray-600 uppercase text-[9px]">
                          <th className="py-1 px-1.5">Sr</th>
                          <th className="py-1 px-1.5">Item &amp; Description</th>
                          <th className="py-1 px-1.5">Make</th>
                          <th className="py-1 px-1.5">Qty</th>
                          <th className="py-1 px-1.5">Planned</th>
                          <th className="py-1 px-1.5">Status</th>
                          <th className="py-1 px-1.5">Actual Qty</th>
                          <th className="py-1 px-1.5">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {cat.items.map((item, idx) => {
                          const key = itemKey(cat.num, item.sr, idx);
                          const st = sState?.boq?.[key] || getDefaultItemState();

                          return (
                            <tr key={key}>
                              <td className="py-1 px-1.5 font-mono-plex whitespace-nowrap">{item.sr}</td>
                              <td className="py-1 px-1.5 max-w-[280px] leading-tight">{item.desc}</td>
                              <td className="py-1 px-1.5 text-gray-700">{item.make || '—'}</td>
                              <td className="py-1 px-1.5 font-mono-plex whitespace-nowrap">
                                {item.uom !== '' ? item.uom : '—'} {item.unit}
                              </td>
                              <td className="py-1 px-1.5 font-mono-plex whitespace-nowrap">
                                {item.total !== '' ? `₹${fmtMoney(item.total)}` : '—'}
                              </td>
                              <td className="py-1 px-1.5 capitalize font-medium">{st.status}</td>
                              <td className="py-1 px-1.5 font-mono-plex">{st.qty || '—'}</td>
                              <td className="py-1 px-1.5 text-gray-700">{st.notes || '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>

            {/* Documents & Approvals Summary */}
            <div className="avoid-break-inside mt-6 pt-4 border-t-2 border-gray-400">
              <h3 className="font-condensed font-bold text-lg uppercase tracking-wide mb-3">
                Documents &amp; Approvals Checklist
              </h3>
              <div className="grid grid-cols-2 gap-4 text-[10.5px]">
                {Object.entries(DOC_CHECKLIST).map(([gk, group]) => (
                  <div key={gk} className="avoid-break-inside border border-gray-200 p-2 rounded">
                    <div className="font-bold text-[11px] mb-1 text-gray-900 border-b border-gray-200 pb-0.5">
                      {group.title}
                    </div>
                    <div className="space-y-1 mt-1">
                      {[...group.items, ...(sState?.customChecklists?.[gk] || [])].map((item, i) => {
                        const checked = Boolean(sState?.docs?.[`${gk}::${i}`]);
                        return (
                          <div key={i} className="flex items-start gap-1.5 leading-tight">
                            <span className="text-gray-800 font-bold">{checked ? '☑' : '☐'}</span>
                            <span className={checked ? 'text-gray-600 line-through' : 'text-gray-900'}>
                              {item.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
