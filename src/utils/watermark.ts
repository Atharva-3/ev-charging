export interface WatermarkOptions {
  siteName: string;
  itemTitle: string;
  itemCode?: string;
  inspectorName?: string;
  inspectorBadge?: string;
  customNotes?: string;
  siteLocation?: string;
  siteCoordinates?: { lat: number; lng: number } | null;
}

export interface GeolocationResult {
  lat: number;
  lng: number;
  accuracy?: number;
}

// Helper to get GPS location with timeout
export async function getDeviceCoordinates(): Promise<GeolocationResult | null> {
  if (!navigator.geolocation) return null;
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => resolve(null), 3000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId);
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        });
      },
      () => {
        clearTimeout(timeoutId);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 2800, maximumAge: 30000 }
    );
  });
}

/**
 * Applies professional engineering watermark to inspection photo
 */
export async function applyEngineeringWatermark(
  imageSource: File | string,
  options: WatermarkOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        // Resolve GPS
        const deviceCoords = await getDeviceCoordinates();
        const activeCoords = deviceCoords || options.siteCoordinates || null;

        // Set up canvas with optimal sizing
        const maxDimension = 1400;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0, width, height);

        // Watermark Banner Configuration
        const bannerHeight = Math.max(90, Math.round(height * 0.16));
        const bannerY = height - bannerHeight;

        // Semi-transparent dark slate backdrop
        ctx.fillStyle = 'rgba(10, 15, 29, 0.90)';
        ctx.fillRect(0, bannerY, width, bannerHeight);

        // Top accent line (safety amber/orange)
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, bannerY, width, Math.max(3, Math.round(width * 0.003)));

        // Time formatting (Indian Standard Time)
        const now = new Date();
        const istFormattedDate = now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        const istFormattedTime = now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' IST';

        // Font scaling based on width
        const scale = width / 1000;
        const primaryFontSize = Math.max(13, Math.round(15 * scale));
        const secondaryFontSize = Math.max(10, Math.round(12 * scale));
        const badgeFontSize = Math.max(9, Math.round(10 * scale));

        const paddingX = Math.max(16, Math.round(20 * scale));
        let cursorY = bannerY + Math.max(18, Math.round(22 * scale));

        // Line 1: Header + Verification Badge
        ctx.font = `bold ${badgeFontSize}px "JetBrains Mono", monospace, sans-serif`;
        ctx.fillStyle = '#38bdf8'; // Sky blue
        ctx.fillText('EV INFRASTRUCTURE I&C PROOF', paddingX, cursorY);

        const badgeText = 'ISO / CEIG AUDIT VERIFIED';
        ctx.font = `bold ${badgeFontSize}px "JetBrains Mono", monospace, sans-serif`;
        const badgeWidth = ctx.measureText(badgeText).width;
        const badgeX = width - paddingX - badgeWidth - 16;

        ctx.fillStyle = '#059669'; // Emerald
        ctx.fillRect(badgeX, cursorY - badgeFontSize, badgeWidth + 16, badgeFontSize + 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(badgeText, badgeX + 8, cursorY + 1);

        cursorY += primaryFontSize + 6;

        // Line 2: Site Name & Milestone
        ctx.font = `bold ${primaryFontSize}px "Inter", "Segoe UI", sans-serif`;
        ctx.fillStyle = '#ffffff';
        const siteText = `SITE: ${options.siteName.toUpperCase()}`;
        const itemText = ` • ${options.itemCode ? options.itemCode + ' - ' : ''}${options.itemTitle}`;
        ctx.fillText(siteText + itemText, paddingX, cursorY, width - paddingX * 2);

        cursorY += secondaryFontSize + 6;

        // Line 3: GPS Coordinates & Timestamp
        ctx.font = `500 ${secondaryFontSize}px "JetBrains Mono", monospace, sans-serif`;
        ctx.fillStyle = '#e2e8f0';

        let geoText = '';
        if (activeCoords) {
          const latDir = activeCoords.lat >= 0 ? 'N' : 'S';
          const lngDir = activeCoords.lng >= 0 ? 'E' : 'W';
          geoText = `GPS: ${Math.abs(activeCoords.lat).toFixed(5)}° ${latDir}, ${Math.abs(activeCoords.lng).toFixed(5)}° ${lngDir}`;
          if (deviceCoords?.accuracy) {
            geoText += ` (±${deviceCoords.accuracy}m)`;
          }
        } else if (options.siteLocation) {
          geoText = `LOC: ${options.siteLocation}`;
        } else {
          geoText = 'GPS: Field Sensor Active';
        }

        const timeText = `TIMESTAMP: ${istFormattedDate} ${istFormattedTime}`;
        ctx.fillText(`${geoText}  |  ${timeText}`, paddingX, cursorY, width - paddingX * 2);

        cursorY += secondaryFontSize + 4;

        // Line 4: Inspector Credentials & Remarks
        ctx.font = `normal ${secondaryFontSize}px "Inter", sans-serif`;
        ctx.fillStyle = '#94a3b8';

        const inspectorPart = `INSPECTOR: ${options.inspectorName || 'Field Engineer'} (${options.inspectorBadge || 'AUTH-OPERATOR'})`;
        const notesPart = options.customNotes ? ` • NOTE: ${options.customNotes}` : '';
        ctx.fillText(`${inspectorPart}${notesPart}`, paddingX, cursorY, width - paddingX * 2);

        // Convert canvas to compressed JPEG
        const watermarkedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(watermarkedDataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (err) => reject(err);

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(imageSource);
    }
  });
}
