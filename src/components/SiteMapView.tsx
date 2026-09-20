import React from 'react';
import { Site } from '../types';
import { MapPin } from 'lucide-react';

interface SiteMapViewProps {
  sites: Site[];
  activeSiteId: string;
}

export const SiteMapView: React.FC<SiteMapViewProps> = ({ sites }) => {
  return (
    <div className="space-y-4 pb-6">
      {sites.map((site) => {
        const hasLoc = Boolean(site.location && site.location.trim().length > 0);
        const mapUrl = hasLoc
          ? `https://www.google.com/maps?q=${encodeURIComponent(site.location || '')}&output=embed`
          : '';

        return (
          <div
            key={site.id}
            className="border border-[var(--steel-line)] rounded-lg bg-[var(--paper-raised)] overflow-hidden shadow-2xs"
          >
            <div className="px-4 py-3 border-b border-[var(--steel-line)] flex items-baseline justify-between gap-3 bg-black/[0.015]">
              <h3 className="font-condensed font-bold text-lg text-[var(--ink)]">
                {site.name}
              </h3>
              {hasLoc && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--steel)]">
                  <MapPin className="w-3.5 h-3.5 text-[var(--rust)] shrink-0" />
                  <span>{site.location}</span>
                </div>
              )}
            </div>

            {hasLoc ? (
              <div className="w-full h-72 bg-[var(--paper)]">
                <iframe
                  src={mapUrl}
                  title={`Map of ${site.name}`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[var(--steel)] bg-[var(--paper-raised)]">
                No location set for this site yet. Select it from the dropdown above and click &quot;Edit&quot; to add an address or coordinates.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
