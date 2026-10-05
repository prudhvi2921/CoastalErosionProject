import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { CoastalSegmentGeo, RiskLevel } from '../types';
import { RiskBadge } from './RiskBadge';
import { Eye, MapPin } from 'lucide-react';

// Custom SVG marker factory for Leaflet
const createCustomMarker = (riskLevel: RiskLevel, isSelected: boolean = false) => {
  const colorMap: Record<RiskLevel, { stroke: string; fill: string; ring: string }> = {
    LOW: { stroke: '#0d9488', fill: '#14b8a6', ring: 'rgba(20, 184, 166, 0.4)' },
    MODERATE: { stroke: '#d97706', fill: '#f59e0b', ring: 'rgba(245, 158, 11, 0.4)' },
    HIGH: { stroke: '#ea580c', fill: '#f97316', ring: 'rgba(249, 115, 22, 0.4)' },
    VERY_HIGH: { stroke: '#dc2626', fill: '#ef4444', ring: 'rgba(239, 68, 68, 0.5)' },
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
    ">
      <div style="
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: ${c.ring};
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        position: relative;
        width: ${size - 8}px;
        height: ${size - 8}px;
        border-radius: 50%;
        background: ${c.fill};
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
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

// Component to recenter map when selected segment changes
const MapRecenter: React.FC<{ selectedSegment: CoastalSegmentGeo | null }> = ({ selectedSegment }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedSegment) {
      map.flyTo([selectedSegment.latitude, selectedSegment.longitude], 9, {
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
  const [mapType, setMapType] = React.useState<'ocean' | 'satellite'>('ocean');

  const defaultCenter: [number, number] = [16.5, 79.5]; // Central Indian coastline overview

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden border border-slate-800/90 shadow-xl">
      {/* Map Layer Switcher Header */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 p-1 shadow-lg backdrop-blur-md">
        <button
          onClick={() => setMapType('ocean')}
          className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
            mapType === 'ocean'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Ocean Dark
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
            mapType === 'satellite'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Map Key Floating Badge */}
      <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center gap-3 rounded-xl bg-slate-900/90 border border-slate-700/80 px-3 py-2 text-[11px] shadow-lg backdrop-blur-md">
        <span className="font-semibold text-slate-300">Risk Color:</span>
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-1.5 text-orange-400">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-400">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span>Very High</span>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={5}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        {mapType === 'ocean' ? (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        )}

        <MapRecenter selectedSegment={selectedSegment} />

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
                <div className="space-y-2 p-1 min-w-[200px]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-100 text-xs">{seg.name}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {seg.latitude.toFixed(4)}°N, {seg.longitude.toFixed(4)}°E
                      </p>
                    </div>
                    <RiskBadge level={seg.riskLevel} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-900/80 p-2 text-[11px] border border-slate-800">
                    <div>
                      <span className="text-slate-400">Erosion Rate:</span>
                      <p className="font-mono font-bold text-slate-200">{seg.erosionRate.toFixed(2)} m/yr</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Latest Pos:</span>
                      <p className="font-mono font-bold text-slate-200">{seg.latestPosition.toFixed(1)} m</p>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    <b>Action:</b> {seg.actionPriority}
                  </div>

                  {onAnalyzeSegment && (
                    <button
                      onClick={() => onAnalyzeSegment(seg.name)}
                      className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-1 text-[11px] font-medium shadow transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Analyze in Studio</span>
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
