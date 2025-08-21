import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlerts } from '@/hooks/useAlerts';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';

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
    const ipParts = ip.split('.');
    if (ipParts.length !== 4) return { lat: 0, lng: 0 };

    const hash1 = parseInt(ipParts[0]) * 3.14159 + parseInt(ipParts[1]) * 2.71828;
    const hash2 = parseInt(ipParts[2]) * 1.41421 + parseInt(ipParts[3]) * 1.73205;

    const lat = ((hash1 % 160) - 80); // -80 to +80
    const lng = ((hash2 % 360) - 180); // -180 to +180

    return { lat, lng };
  };

  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const threatLocations: ThreatLocation[] = alerts.slice(0, 50).map(alert => {
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
    }
  }, [alerts]);

  const mapCenter: LatLngExpression = [20, 0];

  const getSeverityColor = (event: string) => {
    const lower = event.toLowerCase();
    if (lower.includes('ssh') || lower.includes('bruteforce')) return '#dc2626';
    if (lower.includes('ddos') || lower.includes('dos')) return '#7c2d12';
    if (lower.includes('scan') || lower.includes('exploit')) return '#ea580c';
    return '#eab308';
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Real-time Global Threat Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Wrapper ensures map doesn’t overlay */}
        <div className="relative h-96 rounded-lg overflow-hidden border border-border z-0">
          <MapContainer
            center={mapCenter}
            zoom={2}
            className="h-full w-full z-0"
            zoomControl
            scrollWheelZoom
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {threats.map(threat => (
              <CircleMarker
                key={threat.id}
                center={[threat.lat, threat.lng] as LatLngExpression}
                pathOptions={{
                  color: getSeverityColor(threat.event),
                  fillColor: getSeverityColor(threat.event),
                  fillOpacity: 0.7,
                  weight: 2,
                }}
                radius={6 + threat.intensity * 8}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <div className="font-semibold text-foreground">{threat.event}</div>
                    <div className="text-muted-foreground">Source IP: {threat.ip}</div>
                    <div className="text-xs text-muted-foreground">
                      Location: {threat.lat.toFixed(2)}, {threat.lng.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">{threat.timestamp}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreatMapLeaflet;
