import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FloodReport } from '@/types/flood';
import { getSeverityColor, getSeverityLabel, getTimeElapsed } from '@/lib/flood-utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface FloodMapProps {
  reports?: FloodReport[];
  center?: LatLngExpression;
  zoom?: number;
  onReportClick?: (report: FloodReport) => void;
}

// Component to handle map centering
function MapController({ center }: { center: LatLngExpression }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export default function FloodMap({ 
  reports = [], 
  center = [14.5995, 120.9842], // Default to Manila
  zoom = 12,
  onReportClick 
}: FloodMapProps) {
  const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: LatLngExpression = [position.coords.latitude, position.coords.longitude];
          setUserLocation(loc);
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  const createCustomIcon = (severity: string) => {
    const color = getSeverityColor(severity as any);
    const svgIcon = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="3" opacity="0.9"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `;
    
    return new Icon({
      iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  const mapCenter = userLocation || center;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        className="w-full h-full z-0"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && <MapController center={userLocation} />}
        
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.location.lat, report.location.lng]}
            icon={createCustomIcon(report.severity)}
            eventHandlers={{
              click: () => onReportClick?.(report),
            }}
          >
            <Popup className="custom-popup">
              <Card className="border-0 shadow-none p-2 min-w-[250px]">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm">{report.location.address}</h3>
                    <Badge 
                      variant="outline" 
                      style={{ 
                        backgroundColor: getSeverityColor(report.severity) + '20',
                        borderColor: getSeverityColor(report.severity),
                        color: getSeverityColor(report.severity)
                      }}
                    >
                      {getSeverityLabel(report.severity)}
                    </Badge>
                  </div>
                  
                  {report.photoUrl && (
                    <img 
                      src={report.photoUrl} 
                      alt="Flood report" 
                      className="w-full h-32 object-cover rounded-md"
                    />
                  )}
                  
                  {report.description && (
                    <p className="text-xs text-muted-foreground">{report.description}</p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {getTimeElapsed(report.timestamp)}
                  </p>
                </div>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
