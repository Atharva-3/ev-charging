import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, X, Printer, Download, AlertTriangle, ShieldCheck, Phone, Zap } from 'lucide-react';
import { Site } from '../types';

interface QrCodePlacardModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site;
}

export const QrCodePlacardModal: React.FC<QrCodePlacardModalProps> = ({ isOpen, onClose, site }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    // Generate site URL with hash anchor
    const siteUrl = `${window.location.origin}${window.location.pathname}#site-${site.id}`;

    QRCode.toDataURL(siteUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code', err));
  }, [isOpen, site]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `QR_Placard_${site.id}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[var(--paper)] rounded-2xl border border-[var(--steel-line)] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--steel-line)] bg-[var(--paper-raised)] flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[var(--rust)]" />
            <div>
              <h3 className="font-condensed font-bold text-lg text-[var(--ink)]">
                Site QR Board &amp; Substation Placard
              </h3>
              <p className="text-[11px] text-[var(--steel)] font-mono-plex">
                Printable DIN-A4 Weatherproof Enclosure Placard for {site.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--steel)] hover:text-[var(--ink)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Placard Container */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center">
          <div
            id="qrPlacardContent"
            className="w-full max-w-md bg-white border-4 border-black p-6 rounded-2xl shadow-md text-black font-sans space-y-4 text-center"
          >
            {/* Caution Banner */}
            <div className="bg-yellow-400 border-2 border-black p-2.5 rounded-xl font-condensed font-black uppercase text-base sm:text-lg tracking-wider text-black flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-black" />
              <span>DANGER • 11kV SUBSTATION &amp; EV CHARGING PLAZA</span>
            </div>

            {/* Station Title */}
            <div>
              <h2 className="font-condensed font-bold text-2xl uppercase tracking-tight text-slate-900">
                {site.name}
              </h2>
              <div className="text-xs text-slate-700 font-medium mt-0.5">
                {site.location || 'Jaipur District, Rajasthan'}
              </div>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-800 text-xs font-mono-plex font-bold">
                Station ID: {site.id.toUpperCase()} • Load: {site.sanctionedLoad || '150 kVA'}
              </div>
            </div>

            {/* High-Resolution QR Code */}
            <div className="p-3 border-2 border-dashed border-slate-400 rounded-2xl inline-block bg-white shadow-xs">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${site.name}`}
                  className="w-52 h-52 mx-auto"
                />
              ) : (
                <div className="w-52 h-52 flex items-center justify-center font-mono-plex text-xs text-slate-400">
                  Generating QR Code...
                </div>
              )}
            </div>

            {/* Scan Instructions */}
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 uppercase font-mono-plex">
                SCAN TO ACCESS FIELD INSPECTION &amp; SLD DOCS
              </div>
              <p className="text-[11px] text-slate-600 max-w-xs mx-auto leading-relaxed">
                Scan with any smartphone camera for live installation checklists, single-line diagrams, statutory certificates, and emergency contacts.
              </p>
            </div>

            {/* Emergency Info Footer */}
            <div className="pt-3 border-t-2 border-slate-300 grid grid-cols-2 gap-2 text-left text-[10.5px] font-mono-plex">
              <div>
                <span className="text-slate-500 block">DISCOM Feeder:</span>
                <strong className="text-slate-900">{site.discomDivision || '11kV Dedicated'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Lead Engineer:</span>
                <strong className="text-slate-900">{site.engineerInCharge || 'Er. R.K. Sharma'}</strong>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200 text-center text-slate-600">
                24x7 Emergency Grid Control: <strong>1912 / +91 141 220 7000</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 border-t border-[var(--steel-line)] bg-[var(--paper-raised)] flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--steel-line)] text-xs font-semibold text-[var(--ink)] hover:bg-black/5 cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--steel-line)] bg-white text-xs font-semibold text-[var(--ink)] hover:border-[var(--ink)] shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-[var(--steel)]" />
              <span>Download PNG</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--ink)] text-white text-xs font-semibold hover:bg-slate-800 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Board Placard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
