import React from 'react';
import { ChevronRight } from 'lucide-react';
import { BoqCategory, SiteTrackerState } from '../types';
import { fmtMoney, itemKey, getCatStats, computeActualCost, getDefaultItemState } from '../utils/formatters';

interface CostAnalysisViewProps {
  categories: BoqCategory[];
  siteState?: SiteTrackerState;
  openCatNum: number | null;
  onToggleCat: (catNum: number) => void;
  onUpdateCostField: (
    key: string,
    field: 'orderRate' | 'qty' | 'transportation' | 'installMaterialCost' | 'labourCharges',
    value: string
  ) => void;
}

export const CostAnalysisView: React.FC<CostAnalysisViewProps> = ({
  categories,
  siteState,
  openCatNum,
  onToggleCat,
  onUpdateCostField
}) => {
  let grandPlanned = 0;
  let grandActual = 0;

  const summaryData = categories.map((cat) => {
    const cs = getCatStats(cat, siteState);
    grandPlanned += cs.plannedTotal;
    grandActual += cs.actualTotal;
    const variance = cs.actualTotal - cs.plannedTotal;
    const variancePct = cs.plannedTotal ? (variance / cs.plannedTotal) * 100 : null;

    return {
      cat,
      planned: cs.plannedTotal,
      actual: cs.actualTotal,
      variance,
      variancePct
    };
  });

  const grandVariance = grandActual - grandPlanned;
  const grandVariancePct = grandPlanned ? (grandVariance / grandPlanned) * 100 : null;

  return (
    <div className="space-y-4 pb-6">
      {/* Category Cost Summary Table */}
      <div className="border border-[var(--steel-line)] rounded-lg bg-[var(--paper-raised)] overflow-x-auto shadow-2xs">
        <table className="w-full border-collapse text-xs text-[var(--ink)]">
          <thead>
            <tr className="bg-black/[0.02] border-b border-[var(--steel-line)] text-[10.5px] uppercase tracking-wider text-[var(--steel)] font-semibold text-left">
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-right">Planned (BOQ)</th>
              <th className="py-2.5 px-3 text-right">Actual</th>
              <th className="py-2.5 px-3 text-right">Variance</th>
              <th className="py-2.5 px-3 text-right">Variance %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {summaryData.map(({ cat, planned, actual, variance, variancePct }) => {
              const isOver = variance > 0;
              const isUnder = variance < 0;
              return (
                <tr key={cat.num} className="hover:bg-black/[0.015] transition-colors">
                  <td className="py-2 px-3 font-medium">
                    <span className="font-mono-plex text-[var(--steel)] mr-2">
                      {String(cat.num).padStart(2, '0')}
                    </span>
                    {cat.name}
                  </td>
                  <td className="py-2 px-3 font-mono-plex text-right whitespace-nowrap">
                    ₹{fmtMoney(planned)}
                  </td>
                  <td className="py-2 px-3 font-mono-plex text-right whitespace-nowrap">
                    ₹{fmtMoney(actual)}
                  </td>
                  <td
                    className={`py-2 px-3 font-mono-plex text-right font-medium whitespace-nowrap ${
                      isOver ? 'text-[var(--rust)]' : isUnder ? 'text-[var(--green)]' : 'text-[var(--ink)]'
                    }`}
                  >
                    {variance >= 0 ? '+' : ''}₹{fmtMoney(variance)}
                  </td>
                  <td
                    className={`py-2 px-3 font-mono-plex text-right whitespace-nowrap ${
                      isOver ? 'text-[var(--rust)]' : isUnder ? 'text-[var(--green)]' : 'text-[var(--steel)]'
                    }`}
                  >
                    {variancePct !== null ? `${variancePct >= 0 ? '+' : ''}${variancePct.toFixed(1)}%` : '—'}
                  </td>
                </tr>
              );
            })}

            {/* Total Row */}
            <tr className="bg-black/[0.03] border-t-2 border-[var(--ink)] font-semibold">
              <td className="py-2.5 px-3 uppercase tracking-wider text-xs">Total</td>
              <td className="py-2.5 px-3 font-mono-plex text-right whitespace-nowrap text-xs">
                ₹{fmtMoney(grandPlanned)}
              </td>
              <td className="py-2.5 px-3 font-mono-plex text-right whitespace-nowrap text-xs">
                ₹{fmtMoney(grandActual)}
              </td>
              <td
                className={`py-2.5 px-3 font-mono-plex text-right whitespace-nowrap text-xs ${
                  grandVariance > 0
                    ? 'text-[var(--rust)]'
                    : grandVariance < 0
                    ? 'text-[var(--green)]'
                    : 'text-[var(--ink)]'
                }`}
              >
                {grandVariance >= 0 ? '+' : ''}₹{fmtMoney(grandVariance)}
              </td>
              <td
                className={`py-2.5 px-3 font-mono-plex text-right whitespace-nowrap text-xs ${
                  grandVariance > 0
                    ? 'text-[var(--rust)]'
                    : grandVariance < 0
                    ? 'text-[var(--green)]'
                    : 'text-[var(--steel)]'
                }`}
              >
                {grandVariancePct !== null
                  ? `${grandVariancePct >= 0 ? '+' : ''}${grandVariancePct.toFixed(1)}%`
                  : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Explanatory Formula Note */}
      <p className="text-[11.5px] text-[var(--steel)] leading-relaxed px-1">
        <span className="font-semibold text-[var(--ink)]">Actual total per item</span> = (Order Rate × Actual Qty) + Transportation + Installation Material Cost + Labour Charges. Actual Qty here is synchronized with the BOQ Items tab. Anything left blank counts as ₹0 spent so far.
      </p>

      {/* Itemized Categories Breakdown */}
      <div className="space-y-2.5">
        {categories.map((cat) => {
          const isOpen = openCatNum === cat.num;
          const cs = getCatStats(cat, siteState);

          return (
            <div
              key={cat.num}
              className="border border-[var(--steel-line)] rounded-lg bg-[var(--paper-raised)] overflow-hidden"
            >
              <div
                onClick={() => onToggleCat(cat.num)}
                className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-black/[0.02] gap-3"
              >
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="font-mono-plex text-xs text-[var(--steel)] font-medium shrink-0">
                    {String(cat.num).padStart(2, '0')}
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-[var(--ink)] truncate">
                    {cat.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono-plex text-xs text-[var(--steel)]">
                    Planned ₹{fmtMoney(cs.plannedTotal)}
                  </span>
                  <span className="font-mono-plex text-xs font-semibold text-[var(--ink)]">
                    Actual ₹{fmtMoney(cs.actualTotal)}
                  </span>
                  <ChevronRight
                    className={`w-4 h-4 text-[var(--steel)] transition-transform duration-200 ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-[var(--steel-line)] overflow-x-auto">
                  <table className="w-full border-collapse text-[11.5px] text-[var(--ink)]">
                    <thead>
                      <tr className="bg-black/[0.02] border-b border-[var(--steel-line)] text-[10px] uppercase tracking-wider text-[var(--steel)] font-semibold text-left">
                        <th className="py-2 px-2.5 whitespace-nowrap">Sr</th>
                        <th className="py-2 px-2.5 min-w-[200px] max-w-[280px]">Item</th>
                        <th className="py-2 px-2.5 whitespace-nowrap">Planned Total</th>
                        <th className="py-2 px-2.5 whitespace-nowrap">Order Rate (₹/unit)</th>
                        <th className="py-2 px-2.5 whitespace-nowrap">Actual Qty</th>
                        <th className="py-2 px-2.5 whitespace-nowrap">Transportation</th>
                        <th className="py-2 px-2.5 whitespace-nowrap">Install Material</th>
                        <th className="py-2 px-2.5 whitespace-nowrap">Labour Charges</th>
                        <th className="py-2 px-2.5 whitespace-nowrap">Actual Total</th>
                        <th className="py-2 px-2.5 whitespace-nowrap">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.04]">
                      {cat.items.map((item, idx) => {
                        const key = itemKey(cat.num, item.sr, idx);
                        const st = siteState?.boq?.[key] || getDefaultItemState();
                        const actualTotal = computeActualCost(st);
                        const planned =
                          typeof item.total === 'number'
                            ? item.total
                            : parseFloat(String(item.total)) || 0;
                        const variance = actualTotal - planned;
                        const isOver = variance > 0;
                        const isUnder = variance < 0;

                        return (
                          <tr key={key} className="hover:bg-black/[0.015] transition-colors">
                            <td className="py-2 px-2.5 font-mono-plex text-xs text-[var(--steel)] whitespace-nowrap">
                              {item.sr}
                            </td>
                            <td className="py-2 px-2.5 max-w-[280px]">
                              <div className="whitespace-pre-line leading-snug line-clamp-3 hover:line-clamp-none">
                                {item.desc}
                              </div>
                            </td>
                            <td className="py-2 px-2.5 font-mono-plex text-xs whitespace-nowrap">
                              ₹{fmtMoney(planned)}
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap">
                              <input
                                type="text"
                                value={st.orderRate}
                                onChange={(e) => onUpdateCostField(key, 'orderRate', e.target.value)}
                                placeholder="₹"
                                className="font-mono-plex text-[11px] px-2 py-1 w-20 rounded border border-[var(--steel-line)] bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                              />
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap">
                              <input
                                type="text"
                                value={st.qty}
                                onChange={(e) => onUpdateCostField(key, 'qty', e.target.value)}
                                placeholder="-"
                                className="font-mono-plex text-[11px] px-2 py-1 w-16 rounded border border-[var(--steel-line)] bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                              />
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap">
                              <input
                                type="text"
                                value={st.transportation}
                                onChange={(e) => onUpdateCostField(key, 'transportation', e.target.value)}
                                placeholder="₹"
                                className="font-mono-plex text-[11px] px-2 py-1 w-20 rounded border border-[var(--steel-line)] bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                              />
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap">
                              <input
                                type="text"
                                value={st.installMaterialCost}
                                onChange={(e) => onUpdateCostField(key, 'installMaterialCost', e.target.value)}
                                placeholder="₹"
                                className="font-mono-plex text-[11px] px-2 py-1 w-20 rounded border border-[var(--steel-line)] bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                              />
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap">
                              <input
                                type="text"
                                value={st.labourCharges}
                                onChange={(e) => onUpdateCostField(key, 'labourCharges', e.target.value)}
                                placeholder="₹"
                                className="font-mono-plex text-[11px] px-2 py-1 w-20 rounded border border-[var(--steel-line)] bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                              />
                            </td>
                            <td className="py-2 px-2.5 font-mono-plex text-xs font-semibold whitespace-nowrap">
                              ₹{fmtMoney(actualTotal)}
                            </td>
                            <td
                              className={`py-2 px-2.5 font-mono-plex text-xs font-semibold whitespace-nowrap ${
                                isOver
                                  ? 'text-[var(--rust)]'
                                  : isUnder
                                  ? 'text-[var(--green)]'
                                  : 'text-[var(--steel)]'
                              }`}
                            >
                              {variance >= 0 ? '+' : ''}₹{fmtMoney(variance)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
