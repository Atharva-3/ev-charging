import React, { useState, useEffect } from 'react';
import { BoqCategory, BoqItem } from '../types';

interface BoqItemModalProps {
  isOpen: boolean;
  mode: 'add-item' | 'edit-item' | 'add-category';
  categories: BoqCategory[];
  targetCatNum: number | null;
  targetItem?: { item: BoqItem; itemIndex: number } | null;
  onClose: () => void;
  onSaveItem: (catNum: number, item: BoqItem, itemIndex?: number) => void;
  onSaveCategory: (category: BoqCategory) => void;
}

export const BoqItemModal: React.FC<BoqItemModalProps> = ({
  isOpen,
  mode,
  categories,
  targetCatNum,
  targetItem,
  onClose,
  onSaveItem,
  onSaveCategory
}) => {
  const [selectedCatNum, setSelectedCatNum] = useState<number>(targetCatNum || categories[0]?.num || 1);
  const [sr, setSr] = useState('');
  const [desc, setDesc] = useState('');
  const [make, setMake] = useState('');
  const [unit, setUnit] = useState('Nos');
  const [uom, setUom] = useState<number | string>(1);
  const [rate, setRate] = useState<number | string>(0);
  const [remark, setRemark] = useState('');

  // Category mode fields
  const [newCatNum, setNewCatNum] = useState<number>(18);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (targetCatNum) {
      setSelectedCatNum(targetCatNum);
    } else if (categories.length > 0) {
      setSelectedCatNum(categories[0].num);
    }

    if (mode === 'edit-item' && targetItem) {
      setSr(String(targetItem.item.sr));
      setDesc(targetItem.item.desc);
      setMake(String(targetItem.item.make || ''));
      setUnit(targetItem.item.unit || 'Nos');
      setUom(targetItem.item.uom);
      setRate(targetItem.item.rate);
      setRemark(targetItem.item.remark || '');
    } else if (mode === 'add-item') {
      const activeCat = categories.find((c) => c.num === (targetCatNum || selectedCatNum));
      const nextIndex = (activeCat?.items.length || 0) + 1;
      setSr(`${targetCatNum || selectedCatNum}.${nextIndex}`);
      setDesc('');
      setMake('DISCOM approved');
      setUnit('Nos');
      setUom(1);
      setRate(0);
      setRemark('');
    } else if (mode === 'add-category') {
      const maxNum = categories.reduce((max, c) => Math.max(max, c.num), 0);
      setNewCatNum(maxNum + 1);
      setNewCatName('');
    }
  }, [mode, targetCatNum, targetItem, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'add-category') {
      if (!newCatName.trim()) return;
      const newCategory: BoqCategory = {
        num: Number(newCatNum),
        name: newCatName.trim(),
        total: 0,
        items: []
      };
      onSaveCategory(newCategory);
      onClose();
      return;
    }

    if (!desc.trim()) return;
    const numUom = typeof uom === 'string' ? parseFloat(uom) || 0 : uom;
    const numRate = typeof rate === 'string' ? parseFloat(rate) || 0 : rate;
    const total = numUom * numRate;

    const newItem: BoqItem = {
      sr: sr.trim() || `${selectedCatNum}.x`,
      desc: desc.trim(),
      make: make.trim(),
      unit: unit.trim() || 'Nos',
      uom: numUom,
      rate: numRate,
      total: total,
      remark: remark.trim()
    };

    onSaveItem(selectedCatNum, newItem, targetItem?.itemIndex);
    onClose();
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
              {mode === 'add-category'
                ? 'Add New BOQ Category'
                : mode === 'edit-item'
                ? 'Edit BOQ Item'
                : 'Add Custom Item to BOQ'}
            </h3>
            <p className="text-xs text-[var(--steel)]">
              {mode === 'add-category'
                ? 'Create a custom category for this site’s specific requirements'
                : 'Add site-specific material, equipment, or service item'}
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
          {mode === 'add-category' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                  Category Number
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newCatNum}
                  onChange={(e) => setNewCatNum(parseInt(e.target.value) || 1)}
                  className="w-28 px-3 py-2 bg-white border border-[var(--steel-line)] rounded-md text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] font-mono-plex"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Solar Canopy & Inverter Integration"
                  className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-md text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                    Target Category
                  </label>
                  <select
                    value={selectedCatNum}
                    onChange={(e) => setSelectedCatNum(Number(e.target.value))}
                    disabled={mode === 'edit-item'}
                    className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-md text-xs font-medium text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] cursor-pointer disabled:bg-gray-100"
                  >
                    {categories.map((c) => (
                      <option key={c.num} value={c.num}>
                        {String(c.num).padStart(2, '0')}. {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                    Item Sr. No.
                  </label>
                  <input
                    type="text"
                    required
                    value={sr}
                    onChange={(e) => setSr(e.target.value)}
                    placeholder="e.g. 1.25"
                    className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-md text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] font-mono-plex"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                  Item Description & Specifications *
                </label>
                <textarea
                  required
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Detailed specification, size, grade, rating..."
                  className="w-full px-3 py-2 bg-white border border-[var(--steel-line)] rounded-md text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                    Make / Brand
                  </label>
                  <input
                    type="text"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. ABB / L&T"
                    className="w-full px-3 py-1.5 bg-white border border-[var(--steel-line)] rounded-md text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                    Planned Qty
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[var(--steel-line)] rounded-md text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] font-mono-plex"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Nos / Mtr / Set"
                    className="w-full px-3 py-1.5 bg-white border border-[var(--steel-line)] rounded-md text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                    Estimated Rate (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[var(--steel-line)] rounded-md text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] font-mono-plex"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--steel)] uppercase tracking-wider mb-1">
                  Remark / Condition
                </label>
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="e.g. As per DISCOM inspection / Site requirement"
                  className="w-full px-3 py-1.5 bg-white border border-[var(--steel-line)] rounded-md text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                />
              </div>
            </>
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
              {mode === 'add-category'
                ? 'Create Category'
                : mode === 'edit-item'
                ? 'Save Item'
                : 'Add to BOQ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
