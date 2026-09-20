import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Check, MapPin, ShieldCheck, Download, RefreshCw, AlertCircle, FileCheck } from 'lucide-react';
import { applyEngineeringWatermark, getDeviceCoordinates, GeolocationResult } from '../utils/watermark';
import { UserSession, Site } from '../types';

interface WatermarkCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  site: Site;
  itemCode?: string;
  itemTitle: string;
  userSession?: UserSession | null;
  existingPhotoUrl?: string;
  onPhotoSaved: (watermarkedDataUrl: string) => void;
}

export const WatermarkCameraModal: React.FC<WatermarkCameraModalProps> = ({
  isOpen,
  onClose,
  site,
  itemCode,
  itemTitle,
  userSession,
  existingPhotoUrl,
  onPhotoSaved
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [watermarkedPreview, setWatermarkedPreview] = useState<string | null>(existingPhotoUrl || null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [gpsLocation, setGpsLocation] = useState<GeolocationResult | null>(null);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [enableWatermark, setEnableWatermark] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Attempt to get device GPS
      getDeviceCoordinates().then((coords) => {
        if (coords) setGpsLocation(coords);
      });
      if (existingPhotoUrl) {
        setWatermarkedPreview(existingPhotoUrl);
      }
    } else {
      setSelectedFile(null);
      setWatermarkedPreview(null);
      setCustomNotes('');
    }
  }, [isOpen, existingPhotoUrl]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    await processAndPreviewImage(file, customNotes, enableWatermark);
  };

  const processAndPreviewImage = async (file: File, notes: string, applyWatermark: boolean) => {
    setIsProcessing(true);
    try {
      if (applyWatermark) {
        const watermarked = await applyEngineeringWatermark(file, {
          siteName: site.name,
          itemCode,
          itemTitle,
          inspectorName: userSession?.name || 'Field Engineer',
          inspectorBadge: userSession?.badgeId || 'VST-WRK-01',
          customNotes: notes,
          siteLocation: site.location,
          siteCoordinates: gpsLocation ? { lat: gpsLocation.lat, lng: gpsLocation.lng } : undefined
        });
        setWatermarkedPreview(watermarked);
      } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setWatermarkedPreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Failed to process watermark', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNotesChange = (val: string) => {
    setCustomNotes(val);
    if (selectedFile) {
      processAndPreviewImage(selectedFile, val, enableWatermark);
    }
  };

  const handleToggleWatermark = (enabled: boolean) => {
    setEnableWatermark(enabled);
    if (selectedFile) {
      processAndPreviewImage(selectedFile, customNotes, enabled);
    }
  };

  const handleSave = () => {
    if (!watermarkedPreview) return;
    onPhotoSaved(watermarkedPreview);
    onClose();
  };

  const handleDownload = () => {
    if (!watermarkedPreview) return;
    const link = document.createElement('a');
    link.href = watermarkedPreview;
    link.download = `VST_${site.id}_${itemCode || 'Proof'}_${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[var(--paper)] rounded-2xl border border-[var(--steel-line)] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--steel-line)] bg-[var(--paper-raised)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--ink)] text-white flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="font-condensed font-bold text-base sm:text-lg text-[var(--ink)] leading-tight">
                Engineering Inspection Photo Proof
              </h3>
              <p className="text-[11px] text-[var(--steel)] font-mono-plex">
                {site.name} • {itemCode ? `${itemCode}: ` : ''}{itemTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--steel)] hover:text-[var(--ink)] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Geolocation Sensor Bar */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-mono-plex">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {gpsLocation
                  ? `GPS Lock: ${gpsLocation.lat.toFixed(5)}° N, ${gpsLocation.lng.toFixed(5)}° E (±${gpsLocation.accuracy}m)`
                  : site.location
                  ? `Site Coords: ${site.location}`
                  : 'Acquiring GPS Satellite Lock...'}
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                const c = await getDeviceCoordinates();
                if (c) {
                  setGpsLocation(c);
                  if (selectedFile) processAndPreviewImage(selectedFile, customNotes, enableWatermark);
                }
              }}
              className="inline-flex items-center gap-1 text-[10.5px] text-slate-400 hover:text-white cursor-pointer"
              title="Refresh GPS Coordinates"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Photo Preview Container */}
          <div className="relative border-2 border-dashed border-[var(--steel-line)] rounded-xl bg-black/5 overflow-hidden flex flex-col items-center justify-center min-h-[260px]">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3 py-12 text-[var(--steel)]">
                <RefreshCw className="w-8 h-8 animate-spin text-[var(--rust)]" />
                <span className="font-mono-plex text-xs font-medium">Applying ISO/CEIG Audit Watermark Banner...</span>
              </div>
            ) : watermarkedPreview ? (
              <div className="w-full relative group">
                <img
                  src={watermarkedPreview}
                  alt="Inspection Verification Proof"
                  className="w-full h-auto max-h-[360px] object-contain mx-auto bg-black"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-medium flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
                    title="Download watermarked image file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Retake / Change</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 px-4 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
                  <Camera className="w-7 h-7 text-[var(--rust)]" />
                </div>
                <div>
                  <h4 className="font-condensed font-bold text-base text-[var(--ink)]">
                    Upload or Capture Ground Inspection Photo
                  </h4>
                  <p className="text-xs text-[var(--steel)] max-w-sm mx-auto mt-1">
                    Select a photo from site work or open device camera. Timestamp, GPS, technician badge and milestone details will be stamped automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--rust)] text-white text-xs font-semibold hover:bg-[var(--rust-hover)] transition-all cursor-pointer shadow-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>Choose Photo or Take Picture</span>
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Watermark Options & Metadata Inputs */}
          <div className="bg-[var(--paper-raised)] p-3.5 rounded-xl border border-[var(--steel-line)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-[var(--ink)]">
                  CEIG / DISCOM Statutory Watermark
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableWatermark}
                  onChange={(e) => handleToggleWatermark(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--rust)]"></div>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-[var(--steel)] mb-1">
                Field Inspection Note / Measurement (Optional)
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="e.g., Earth test: 1.42 Ω with Megger, Cable lugs crimped with 16T hydraulic press"
                className="w-full px-3 py-1.5 text-xs bg-white border border-[var(--steel-line)] rounded-lg focus:outline-hidden focus:border-[var(--ink)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--steel)] pt-1">
              <div>
                <span className="font-semibold text-[var(--ink)]">Inspector:</span>{' '}
                {userSession?.name || 'Er. Field Lead'} ({userSession?.badgeId || 'VST-WRK-01'})
              </div>
              <div className="text-right">
                <span className="font-semibold text-[var(--ink)]">Audit Standard:</span> IS 3043 / CEA 2010
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[var(--steel-line)] bg-[var(--paper-raised)] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--steel-line)] text-xs font-semibold text-[var(--ink)] hover:bg-black/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!watermarkedPreview || isProcessing}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--green)] hover:opacity-95 text-white text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Confirm &amp; Attach Proof</span>
          </button>
        </div>
      </div>
    </div>
  );
};
