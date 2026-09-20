import { BoqCategory, BoqItemState, BoqStats, CatStats, DocStats, SiteTrackerState } from '../types';
import { DOC_CHECKLIST } from '../data/initialData';

export function fmtMoney(n: number | string | null | undefined): string {
  if (n === '' || n === null || n === undefined || isNaN(Number(n))) return '';
  return Number(n).toLocaleString('en-IN');
}

export function prMoney(n: number | string | null | undefined): string {
  if (n === '' || n === null || n === undefined || isNaN(Number(n))) return '';
  return '₹' + Number(n).toLocaleString('en-IN');
}

export function itemKey(catNum: number, sr: string | number, idx: number): string {
  const srStr = String(sr ?? '').trim();
  return `${catNum}::${srStr !== '' ? srStr : 'r' + idx}`;
}

export function getDefaultItemState(): BoqItemState {
  return {
    status: 'pending',
    qty: '',
    notes: '',
    orderRate: '',
    transportation: '',
    installMaterialCost: '',
    labourCharges: ''
  };
}

export function computeActualCost(st?: Partial<BoqItemState> | null): number {
  if (!st) return 0;
  const qty = parseFloat(st.qty || '0') || 0;
  const orderRate = parseFloat(st.orderRate || '0') || 0;
  const transport = parseFloat(st.transportation || '0') || 0;
  const installMat = parseFloat(st.installMaterialCost || '0') || 0;
  const labour = parseFloat(st.labourCharges || '0') || 0;
  return (qty * orderRate) + transport + installMat + labour;
}

const STATUS_WEIGHT: Record<string, number> = {
  pending: 0,
  ordered: 0.33,
  installed: 0.75,
  verified: 1
};

export function getBoqStats(cats: BoqCategory[], siteState?: SiteTrackerState): BoqStats {
  let totalItems = 0;
  let weighted = 0;
  let plannedTotal = 0;
  let actualTotal = 0;

  cats.forEach((cat) => {
    cat.items.forEach((item, idx) => {
      if (item.total === '' && item.rate === '' && item.desc === '') return;
      const key = itemKey(cat.num, item.sr, idx);
      const st = siteState?.boq?.[key] || getDefaultItemState();
      totalItems++;
      weighted += STATUS_WEIGHT[st.status] || 0;
      plannedTotal += typeof item.total === 'number' ? item.total : parseFloat(String(item.total)) || 0;
      actualTotal += computeActualCost(st);
    });
  });

  const pct = totalItems ? Math.round((weighted / totalItems) * 100) : 0;
  return { pct, totalItems, plannedTotal, actualTotal };
}

export function getCatStats(cat: BoqCategory, siteState?: SiteTrackerState): CatStats {
  let total = 0;
  let weighted = 0;
  let plannedTotal = 0;
  let actualTotal = 0;

  cat.items.forEach((item, idx) => {
    const key = itemKey(cat.num, item.sr, idx);
    const st = siteState?.boq?.[key] || getDefaultItemState();
    total++;
    weighted += STATUS_WEIGHT[st.status] || 0;
    plannedTotal += typeof item.total === 'number' ? item.total : parseFloat(String(item.total)) || 0;
    actualTotal += computeActualCost(st);
  });

  return {
    pct: total ? Math.round((weighted / total) * 100) : 0,
    plannedTotal,
    actualTotal
  };
}

export function getDocStats(siteState?: SiteTrackerState): DocStats {
  let total = 0;
  let checked = 0;

  Object.keys(DOC_CHECKLIST).forEach((gk) => {
    DOC_CHECKLIST[gk].items.forEach((_, i) => {
      total++;
      if (siteState?.docs?.[`${gk}::${i}`]) {
        checked++;
      }
    });
  });

  return {
    total,
    checked,
    pct: total ? Math.round((checked / total) * 100) : 0
  };
}
