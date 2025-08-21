import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlerts } from '@/hooks/useAlerts';

const SimpleThreatMap = () => {
  const { alerts } = useAlerts();

  // Convert IP to approximate coordinates (demo/hash method)
  const getCoordinatesFromIP = (ip: string) => {
    const parts = ip.split('.');
    if (parts.length !== 4) return { x: Math.random() * 100, y: Math.random() * 100 };
    const hashX = (parseInt(parts[0]) * 3.14159 + parseInt(parts[1]) * 2.71828) % 100;
    const hashY = (parseInt(parts[2]) * 1.41421 + parseInt(parts[3]) * 1.73205) % 100;
    return { x: hashX, y: hashY };
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">Real-time Threat Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 rounded-lg border border-border bg-secondary/20 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/30 to-secondary/10" />
          
          <div className="relative w-full h-full">
            {alerts.slice(0, 10).map((alert) => {
              const coords = getCoordinatesFromIP(alert.source_ip);
              return (
                <div
                  key={alert.id}
                  className="absolute w-3 h-3 bg-red-500 rounded-full animate-pulse"
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)'
                  }}
                  title={`${alert.event} from ${alert.source_ip}`}
                />
              );
            })}
          </div>
          
          <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
            Showing {Math.min(alerts.length, 10)} active threats
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleThreatMap;
