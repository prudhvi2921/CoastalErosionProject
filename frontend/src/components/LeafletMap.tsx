import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CoastalSegmentGeo, RiskLevel } from '../types';
import { RiskBadge } from './RiskBadge';
import { Eye, MapPin, Maximize2, Layers, Compass } from 'lucide-react';

// Custom high-visibility SVG marker factory with animated pulse rings
const createCustomMarker = (riskLevel: RiskLevel, isSelected: boolean = false) => {
  const colorMap: Record<RiskLevel, { stroke: string; fill: string; ring: string }> = {
    LOW: { stroke: '#0d9488', fill: '#14b8a6', ring: 'rgba(20, 184, 166, 0.45)' },
    MODERATE: { stroke: '#d97706', fill: '#f59e0b', ring: 'rgba(245, 158, 11, 0.45)' },
    HIGH: { stroke: '#ea580c', fill: '#f97316', ring: 'rgba(249, 115, 22, 0.5)' },
    VERY_HIGH: { stroke: '#dc2626', fill: '#ef4444', ring: 'rgba(239, 68, 68, 0.6)' },
  };

  const c = colorMap[riskLevel] || colorMap.LOW;
  const size = isSelected ? 36 : 28;

  const svgHtml = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    ">
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: ${c.ring};
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        ${isSelected ? 'transform: scale(1.3); box-shadow: 0 0 16px ' + c.fill + ';' : ''}
      "></div>
      <div style="
        position: relative;
        width: ${size - 10}px;
        height: ${size - 10}px;
        border-radius: 50%;
        background: ${c.fill};
        border: 2px solid #ffffff;
        box-shadow: 0 3px 10px rgba(0,0,0,0.6);
        transition: transform 0.2s ease;
      "></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-map-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// Map controller component to handle flyTo, bounds fitting, and responsive resize
const MapController: React.FC<{
  segments: CoastalSegmentGeo[];
  selectedSegment: CoastalSegmentGeo | null;
  triggerFitAll: number;
}> = ({ segments, selectedSegment, triggerFitAll }) => {
  const map = useMap();
  const initialFitDone = useRef(false);

  // Invalidate map size on mount and on window resize
  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  // Initial bounds fit on mount or when segments change
  useEffect(() => {
    if (segments.length > 0 && (!initialFitDone.current || triggerFitAll > 0)) {
      const validPoints = segments
        .filter((s) => !isNaN(s.latitude) && !isNaN(s.longitude))
        .map((s) => [s.latitude, s.longitude] as [number, number]);

      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: 9,
          animate: true,
        });
        initialFitDone.current = true;
      }
    }
  }, [segments, triggerFitAll, map]);

  // Recenter when a specific segment is selected
  useEffect(() => {
    if (selectedSegment && !isNaN(selectedSegment.latitude) && !isNaN(selectedSegment.longitude)) {
      map.flyTo([selectedSegment.latitude, selectedSegment.longitude], 10, {
        duration: 1.2,
      });
    }
  }, [selectedSegment, map]);

  return null;
};

interface LeafletMapProps {
  segments: CoastalSegmentGeo[];
  selectedSegment: CoastalSegmentGeo | null;
  onSelectSegment: (segment: CoastalSegmentGeo) => void;
  onAnalyzeSegment?: (segmentName: string) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  segments,
  selectedSegment,
  onSelectSegment,
  onAnalyzeSegment,
}) => {
  const [mapType, setMapType] = useState<'ocean' | 'satellite' | 'marine' | 'osm'>('ocean');
  const [fitTrigger, setFitTrigger] = useState(0);

  // Default fallback center covering Indian & Global coastline
  const defaultCenter: [number, number] = [16.5, 80.5];

  return (
    <div className="relative h-full w-full min-h-[300px] rounded-2xl overflow-hidden border border-slate-800/90 shadow-xl bg-[#08111d]">
      {/* Top Map Control Bar (Responsive flex-wrap layout) */}
      <div className="absolute top-2.5 right-2.5 z-[400] flex items-center gap-1 rounded-xl bg-slate-900/95 border border-slate-700/80 p-1 shadow-2xl backdrop-blur-md">
        <button
          onClick={() => setMapType('ocean')}
          title="Dark Canvas with coastal outlines"
          className={`rounded-lg px-2 py-1 text-[10px] sm:text-[11px] font-semibold transition-all ${
            mapType === 'ocean'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ocean
        </button>
        <button
          onClick={() => setMapType('satellite')}
          title="Satellite imagery"
          className={`rounded-lg px-2 py-1 text-[10px] sm:text-[11px] font-semibold transition-all ${
            mapType === 'satellite'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapType('marine')}
          title="Marine bathymetry"
          className={`rounded-lg px-2 py-1 text-[10px] sm:text-[11px] font-semibold transition-all ${
            mapType === 'marine'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Marine
        </button>
        <button
          onClick={() => setMapType('osm')}
          title="OpenStreetMap standard"
          className={`hidden xs:inline-block rounded-lg px-2 py-1 text-[10px] sm:text-[11px] font-semibold transition-all ${
            mapType === 'osm'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          OSM
        </button>

        <div className="h-3.5 w-px bg-slate-700 mx-0.5" />

        {/* Fit all locations button */}
        <button
          onClick={() => setFitTrigger((prev) => prev + 1)}
          title="Fit all transects in viewport"
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] sm:text-[11px] font-semibold text-slate-300 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
        >
          <Maximize2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span className="hidden sm:inline">Fit All</span>
        </button>
      </div>

      {/* Floating Location Selector Bar on top-left (Responsive max-w) */}
      <div className="absolute top-2.5 left-2.5 z-[400] max-w-[140px] xs:max-w-[180px] sm:max-w-xs">
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/95 border border-slate-700/80 px-2 py-1.5 shadow-lg backdrop-blur-md">
          <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <select
            value={selectedSegment?.name || ''}
            onChange={(e) => {
              const matched = segments.find((s) => s.name === e.target.value);
              if (matched) onSelectSegment(matched);
            }}
            className="bg-transparent text-[10px] sm:text-[11px] font-medium text-slate-200 focus:outline-none cursor-pointer truncate max-w-full"
          >
            <option value="" disabled className="bg-slate-900 text-slate-400">
              Jump to reach ({segments.length})...
            </option>
            {segments.map((seg) => (
              <option key={seg.name} value={seg.name} className="bg-slate-900 text-slate-200">
                {seg.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Legend Floating Key (Hidden on tiny screens, shown on sm+) */}
      <div className="absolute bottom-3 left-3 z-[400] hidden sm:flex items-center gap-2.5 rounded-xl bg-slate-900/95 border border-slate-700/80 px-3 py-1.5 text-[10px] shadow-2xl backdrop-blur-md">
        <span className="font-semibold text-slate-300">Risk Key:</span>
        <div className="flex items-center gap-1 text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>Mod</span>
        </div>
        <div className="flex items-center gap-1 text-orange-400">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1 text-red-400">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span>V.High</span>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        {/* Ocean Dark: Esri Dark Canvas with coastal outlines */}
        {mapType === 'ocean' && (
          <>
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
            <TileLayer
              attribution=""
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
          </>
        )}

        {/* Satellite HD: Esri World Imagery */}
        {mapType === 'satellite' && (
          <>
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
            <TileLayer
              attribution=""
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </>
        )}

        {/* Marine: Esri Ocean Basemap & Bathymetry */}
        {mapType === 'marine' && (
          <>
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>, GEBCO'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={13}
            />
            <TileLayer
              attribution=""
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}"
              maxZoom={13}
            />
          </>
        )}

        {/* OpenStreetMap Standard */}
        {mapType === 'osm' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        <MapController
          segments={segments}
          selectedSegment={selectedSegment}
          triggerFitAll={fitTrigger}
        />

        {segments.map((seg) => {
          const isSel = selectedSegment?.name === seg.name;
          const icon = createCustomMarker(seg.riskLevel, isSel);

          return (
            <Marker
              key={seg.name}
              position={[seg.latitude, seg.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectSegment(seg),
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="space-y-2 p-1 min-w-[200px] max-w-[260px]">
                  <div className="flex items-start justify-between gap-1.5 border-b border-slate-800 pb-1.5">
                    <div>
                      <h4 className="font-bold text-slate-100 text-xs">{seg.name}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-cyan-400" />
                        {seg.latitude.toFixed(4)}°N, {seg.longitude.toFixed(4)}°E
                      </p>
                    </div>
                    <RiskBadge level={seg.riskLevel} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-900/90 p-2 text-[10px] border border-slate-800">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Erosion Rate:</span>
                      <p className="font-mono font-bold text-cyan-300">{seg.erosionRate.toFixed(2)} m/yr</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">Latest Pos:</span>
                      <p className="font-mono font-bold text-slate-200">{seg.latestPosition.toFixed(1)} m</p>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-300 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 font-semibold block text-[9px]">Guidance:</span>
                    {seg.actionPriority}
                  </div>

                  {onAnalyzeSegment && (
                    <button
                      onClick={() => onAnalyzeSegment(seg.name)}
                      className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 text-[11px] font-semibold shadow-lg shadow-cyan-600/30 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Forecast in Studio</span>
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
