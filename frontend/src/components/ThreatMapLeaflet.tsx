import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlerts } from '@/hooks/useAlerts';
import 'leaflet/dist/leaflet.css';
import { LatLngTuple } from 'leaflet';

interface ThreatLocation {
  id: string;
  lat: number;
  lng: number;
  intensity: number;
  ip: string;
  event: string;
  timestamp: string;
}

const ThreatMapLeaflet = () => {
  const { alerts } = useAlerts();
  const [threats, setThreats] = useState<ThreatLocation[]>([]);

  const getCoordinatesFromIP = (ip: string): { lat: number; lng: number } => {
    const hash = ip.split('.').reduce((acc, octet) => acc + (parseInt(octet) || 0), 0);
    const lat = (hash % 180) - 90;
    const lng = ((hash * 2) % 360) - 180;
    return { lat, lng };
  };

  useEffect(() => {
    const threatLocations: ThreatLocation[] = alerts.slice(0, 20).map((alert) => {
      const coords = getCoordinatesFromIP(alert.source_ip);
      return {
        id: alert.id.toString(),
        lat: coords.lat,
        lng: coords.lng,
        intensity: Math.random() * 0.8 + 0.2,
        ip: alert.source_ip,
        event: alert.event,
        timestamp: alert.timestamp,
      };
    });
    setThreats(threatLocations);
  }, [alerts]);

  const mapCenter: LatLngTuple = [20, 0];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Real-time Threat Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 rounded-lg overflow-hidden border border-border">
          <MapContainer
            center={mapCenter}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {threats.map((threat) => {
              const position: LatLngTuple = [threat.lat, threat.lng];
              return (
                <CircleMarker
                  key={threat.id}
                  center={position}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.6 + threat.intensity * 0.4,
                    weight: 2,
                  }}
                  radius={8 + threat.intensity * 12} // radius is now correct type
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold text-foreground">{threat.event}</div>
                      <div className="text-muted-foreground">IP: {threat.ip}</div>
                      <div className="text-xs text-muted-foreground">{threat.timestamp}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Showing {threats.length} active threats from recent alerts
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreatMapLeaflet;