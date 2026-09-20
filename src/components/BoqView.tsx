import React, { useState } from 'react';
import {
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BoqCategory, BoqItem, BoqItemStatus, SiteTrackerState } from '../types';
import { fmtMoney, itemKey, getCatStats, getDefaultItemState } from '../utils/formatters';

interface BoqViewProps {
  categories: BoqCategory[];
  siteState?: SiteTrackerState;
  openCatNum: number | null;
  userRole?: 'manager' | 'worker';
  onToggleCat: (catNum: number) => void;
  onUpdateStatus: (key: string, status: BoqItemStatus) => void;
  onUpdateField: (key: string, field: 'qty' | 'notes', value: string) => void;
  onAddItemClick?: (catNum?: number) => void;
  onAddCategoryClick?: () => void;
  onEditItemClick?: (catNum: number, item: BoqItem, itemIndex: number) => void;
  onDeleteItem?: (catNum: number, itemIndex: number) => void;
  onDeleteCategory?: (catNum: number) => void;
}

export const BoqView: React.FC<BoqViewProps> = ({
  categories,
  siteState,
  openCatNum,
  userRole = 'manager',
  onToggleCat,
  onUpdateStatus,
  onUpdateField,
  onAddItemClick,
  onAddCategoryClick,
  onEditItemClick,
  onDeleteItem,
  onDeleteCategory
}) => {
  const isWorker = userRole === 'worker';
  const isManager = userRole === 'manager';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleDeleteItemConfirm = (e: React.MouseEvent, catNum: number, idx: number, itemDesc: string) => {
    e.stopPropagation();
    if (window.confirm(`Remove item "${itemDesc.slice(0, 40)}..." from this site's BOQ?`)) {
      onDeleteItem?.(catNum, idx);
    }
  };

  const handleDeleteCatConfirm = (e: React.MouseEvent, catNum: number, catName: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete entire category "${catName}" and all its items from this site?`)) {
      onDeleteCategory?.(catNum);
    }
  };

  return (
    <div className="space-y-3.5 pb-6">
      {/* Top Toolbar for Customizing BOQ for this site */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[var(--paper-raised)] border border-[var(--steel-line)] rounded-lg">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-[var(--steel)] absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items, make, specs..."
              className="w-full pl-8 pr-2.5 py-1 bg-white border border-[var(--steel-line)] rounded text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1 px-2 bg-white border border-[var(--steel-line)] rounded text-[var(--ink)] cursor-pointer focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="ordered">Ordered</option>
            <option value="installed">Installed</option>
            <option value="verified">Verified</option>
          </select>
        </div>

        {/* Action buttons to customize BOQ as per site requirements (Manager only) */}
        {isManager && (
          <div className="flex items-center gap-2 shrink-0">
            {onAddCategoryClick && (
              <button
                onClick={onAddCategoryClick}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-[var(--steel-line)] bg-white text-xs font-medium text-[var(--ink)] hover:border-[var(--ink)] transition-colors cursor-pointer shadow-xs"
                title="Add a custom category (e.g. Solar Canopy, BESS, High Mast)"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            )}

            {onAddItemClick && (
              <button
                onClick={() => onAddItemClick()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[var(--ink)] text-[var(--paper-raised)] text-xs font-semibold hover:bg-[#132029] transition-colors cursor-pointer shadow-xs"
                title="Add custom item to this site's BOQ"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add BOQ Item</span>
              </button>
            )}
          </div>
        )}

        {isWorker && (
          <div className="text-[11px] text-[var(--steel)] font-mono-plex flex items-center gap-1 shrink-0">
            <span>Ground installation status reporting active</span>
          </div>
        )}
      </div>

      {/* Category Accordions */}
      {categories.map((cat) => {
        const isOpen = openCatNum === cat.num;
        const cs = getCatStats(cat, siteState);

        // Filter items based on search and status
        const filteredItems = cat.items
          .map((item, idx) => ({ item, idx }))
          .filter(({ item, idx }) => {
            const key = itemKey(cat.num, item.sr, idx);
            const st = siteState?.boq?.[key] || getDefaultItemState();

            const matchesSearch =
              searchTerm === '' ||
              item.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(item.make).toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(item.sr).toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
              statusFilter === 'all' || st.status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
          });

        if (searchTerm && filteredItems.length === 0) {
          return null;
        }

        return (
          <div
            key={cat.num}
            className="border border-[var(--steel-line)] rounded-lg bg-[var(--paper-raised)] overflow-hidden transition-shadow"
          >
            {/* Category Header */}
            <div
              onClick={() => onToggleCat(cat.num)}
              className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-black/[0.02] gap-3"
            >
              <div className="flex items-baseline gap-2.5 min-w-0 flex-1">
                <span className="font-mono-plex text-xs text-[var(--steel)] font-medium shrink-0">
                  {String(cat.num).padStart(2, '0')}
                </span>
                <span className="font-semibold text-sm sm:text-base text-[var(--ink)] truncate">
                  {cat.name}
                </span>
                <span className="text-[11px] text-[var(--steel)] font-mono-plex shrink-0">
                  ({cat.items.length} items)
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <span className="font-mono-plex text-xs text-[var(--steel)] hidden sm:inline-block">
                  ₹{fmtMoney(cat.total)}
                </span>
                <div className="w-14 sm:w-16 h-1.5 bg-[var(--steel-line)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--green)] transition-all duration-300"
                    style={{ width: `${cs.pct}%` }}
                  />
                </div>
                <span className="font-mono-plex text-xs font-semibold text-[var(--steel)] min-w-[32px] text-right">
                  {cs.pct}%
                </span>

                {/* Quick Add Item to this specific category (Manager only) */}
                {isManager && onAddItemClick && (
                  <button
                    onClick={() => onAddItemClick(cat.num)}
                    className="p-1 rounded text-[var(--steel)] hover:text-[var(--ink)] hover:bg-white border border-transparent hover:border-[var(--steel-line)] transition-colors cursor-pointer"
                    title={`Add custom item to category ${cat.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Category Delete (Manager only) */}
                {isManager && onDeleteCategory && (
                  <button
                    onClick={(e) => handleDeleteCatConfirm(e, cat.num, cat.name)}
                    className="p-1 rounded text-[var(--steel)] hover:text-[var(--rust)] hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <ChevronRight
                  onClick={() => onToggleCat(cat.num)}
                  className={`w-4 h-4 text-[var(--steel)] transition-transform duration-200 cursor-pointer ${
                    isOpen ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </div>

            {/* Category Items Table */}
            {isOpen && (
              <div className="border-t border-[var(--steel-line)] overflow-x-auto">
                <table className="w-full border-collapse text-[12px] text-[var(--ink)]">
                  <thead>
                    <tr className="bg-black/[0.02] border-b border-[var(--steel-line)] text-[10.5px] uppercase tracking-wider text-[var(--steel)] font-semibold text-left">
                      <th className="py-2 px-2.5 whitespace-nowrap">Sr</th>
                      <th className="py-2 px-2.5 min-w-[240px] max-w-[320px]">Item &amp; Description</th>
                      <th className="py-2 px-2.5 min-w-[100px] max-w-[140px]">Make</th>
                      <th className="py-2 px-2.5 whitespace-nowrap">Qty</th>
                      <th className="py-2 px-2.5 whitespace-nowrap">Rate</th>
                      <th className="py-2 px-2.5 whitespace-nowrap">Planned</th>
                      <th className="py-2 px-2.5 whitespace-nowrap">Status</th>
                      <th className="py-2 px-2.5 whitespace-nowrap">Actual Qty</th>
                      <th className="py-2 px-2.5 min-w-[110px]">Notes</th>
                      <th className="py-2 px-2.5 min-w-[100px] max-w-[140px]">Remark</th>
                      <th className="py-2 px-2.5 whitespace-nowrap text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-4 text-center text-xs text-[var(--steel)]">
                          No items match the current filter in this category.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map(({ item, idx }) => {
                        const key = itemKey(cat.num, item.sr, idx);
                        const st = siteState?.boq?.[key] || getDefaultItemState();

                        const statusClasses: Record<BoqItemStatus, string> = {
                          pending: 'bg-white border-[var(--steel-line)] text-[var(--ink)]',
                          ordered: 'bg-[#FBF0DC] border-[var(--amber)] text-[#8c5e11]',
                          installed: 'bg-[#E4EEE8] border-[var(--green)] text-[#265538]',
                          verified: 'bg-[#DCEAF2] border-[var(--blue)] text-[#244c6c] font-semibold'
                        };

                        return (
                          <tr key={key} className="hover:bg-black/[0.015] transition-colors group">
                            <td className="py-2 px-2.5 font-mono-plex text-xs text-[var(--steel)] whitespace-nowrap">
                              {item.sr}
                            </td>
                            <td className="py-2 px-2.5 max-w-[320px]">
                              <div className="whitespace-pre-line leading-snug line-clamp-4 hover:line-clamp-none">
                                {item.desc}
                              </div>
                            </td>
                            <td className="py-2 px-2.5 text-xs text-[var(--steel)] max-w-[140px] break-words">
                              {item.make || '—'}
                            </td>
                            <td className="py-2 px-2.5 font-mono-plex text-xs whitespace-nowrap">
                              {item.uom !== '' ? item.uom : '—'} {item.unit}
                            </td>
                            <td className="py-2 px-2.5 font-mono-plex text-xs whitespace-nowrap">
                              {item.rate !== '' ? `₹${fmtMoney(item.rate)}` : '—'}
                            </td>
                            <td className="py-2 px-2.5 font-mono-plex text-xs font-medium whitespace-nowrap">
                              {item.total !== '' ? `₹${fmtMoney(item.total)}` : '—'}
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap">
                              <select
                                value={st.status}
                                onChange={(e) => onUpdateStatus(key, e.target.value as BoqItemStatus)}
                                className={`text-[11.5px] px-2 py-1 rounded-md border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--ink)] transition-colors ${
                                  statusClasses[st.status]
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="ordered">Ordered</option>
                                <option value="installed">Installed</option>
                                <option value="verified">Verified</option>
                              </select>
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap">
                              <input
                                type="text"
                                value={st.qty}
                                onChange={(e) => onUpdateField(key, 'qty', e.target.value)}
                                placeholder="-"
                                className="font-mono-plex text-[11.5px] px-2 py-1 w-16 rounded border border-[var(--steel-line)] bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                              />
                            </td>
                            <td className="py-2 px-2.5">
                              <input
                                type="text"
                                value={st.notes}
                                onChange={(e) => onUpdateField(key, 'notes', e.target.value)}
                                placeholder="remark..."
                                className="text-[11.5px] px-2 py-1 w-full min-w-[100px] rounded border border-[var(--steel-line)] bg-white text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                              />
                            </td>
                            <td className="py-2 px-2.5 text-[11px] text-[var(--steel)] max-w-[140px] italic">
                              {item.remark || ''}
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap text-right">
                              {isManager && (
                                <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                  {onEditItemClick && (
                                    <button
                                      onClick={() => onEditItemClick(cat.num, item, idx)}
                                      className="p-1 text-[var(--steel)] hover:text-[var(--ink)] rounded cursor-pointer transition-colors"
                                      title="Edit BOQ item"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {onDeleteItem && (
                                    <button
                                      onClick={(e) => handleDeleteItemConfirm(e, cat.num, idx, item.desc)}
                                      className="p-1 text-[var(--steel)] hover:text-[var(--rust)] rounded cursor-pointer transition-colors"
                                      title="Delete BOQ item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
