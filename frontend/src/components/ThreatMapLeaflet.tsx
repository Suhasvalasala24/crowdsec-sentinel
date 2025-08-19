
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

  // Function to get approximate coordinates from IP geolocation
  const getCoordinatesFromIP = (ip: string): { lat: number; lng: number } => {
    // This is a simple hash-based approach for demo purposes
    // In production, you'd want to use a real IP geolocation service
    const ipParts = ip.split('.');
    if (ipParts.length !== 4) return { lat: 0, lng: 0 };
    
    const hash1 = parseInt(ipParts[0]) * 3.14159 + parseInt(ipParts[1]) * 2.71828;
    const hash2 = parseInt(ipParts[2]) * 1.41421 + parseInt(ipParts[3]) * 1.73205;
    
    // Map to realistic world coordinates
    const lat = ((hash1 % 160) - 80); // -80 to +80 (most populated areas)
    const lng = ((hash2 % 360) - 180); // -180 to +180
    
    return { lat, lng };
  };

  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const threatLocations: ThreatLocation[] = alerts.slice(0, 50).map((alert) => {
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

  const mapCenter: LatLngTuple = [20, 0];

  const getSeverityColor = (event: string) => {
    if (event.toLowerCase().includes('ssh') || event.toLowerCase().includes('bruteforce')) {
      return '#dc2626'; // red
    }
    if (event.toLowerCase().includes('ddos') || event.toLowerCase().includes('dos')) {
      return '#7c2d12'; // dark red
    }
    if (event.toLowerCase().includes('scan') || event.toLowerCase().includes('exploit')) {
      return '#ea580c'; // orange
    }
    return '#eab308'; // yellow for other threats
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Real-time Global Threat Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 rounded-lg overflow-hidden border border-border">
          <MapContainer
            center={mapCenter}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            {/* Use OpenStreetMap tiles that show country borders clearly */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Render threat markers */}
            {threats.map((threat) => {
              const position: LatLngTuple = [threat.lat, threat.lng];
              const color = getSeverityColor(threat.event);
              
              return (
                <CircleMarker
                  key={threat.id}
                  center={position}
                  pathOptions={{
                    color: color,
                    fillColor: color,
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
              );
            })}
          </MapContainer>
        </div>
        
        <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
          <div>Showing {threats.length} active threats from recent alerts</div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <span>Medium</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreatMapLeaflet;
