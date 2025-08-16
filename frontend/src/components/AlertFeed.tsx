import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, AlertTriangle, Shield, Zap, Scan, Calendar } from "lucide-react";
import { useAlerts, Alert } from "@/hooks/useAlerts";

const AlertFeed = () => {
  const { alerts, loading } = useAlerts();
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const getIconForEvent = (event: string) => {
    const eventLower = event.toLowerCase();
    if (eventLower.includes('ssh') || eventLower.includes('bruteforce')) return Shield;
    if (eventLower.includes('scan')) return Scan;
    if (eventLower.includes('ddos') || eventLower.includes('dos')) return Zap;
    return AlertTriangle;
  };

  const getDetailsFromEvent = (event: string): string => {
    const eventLower = event.toLowerCase();
    if (eventLower.includes('ssh')) return 'authentication_fail';
    if (eventLower.includes('scan')) return 'port_scan';
    if (eventLower.includes('ddos')) return 'distributed_dos';
    if (eventLower.includes('web')) return 'path_traversal';
    return 'suspicious_activity';
  };

  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter === "all") return true;
    return alert.severity?.toLowerCase() === severityFilter.toLowerCase();
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'hsl(var(--critical))';
      case 'High':
        return 'hsl(var(--high))';
      case 'Medium':
        return 'hsl(var(--medium))';
      case 'Low':
        return 'hsl(var(--low))';
      case 'Ddos':
        return 'hsl(280 100% 70%)';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const color = getSeverityColor(severity);
    return (
      <Badge 
        variant="outline" 
        className="text-xs font-medium border-0 px-2 py-1 rounded-md"
        style={{ 
          backgroundColor: `${color}20`,
          color: color,
          border: `1px solid ${color}40`
        }}
      >
        {severity}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground">Alert Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading alerts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">Alert Feed</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-muted-foreground"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
        
        {showFilters && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="ddos">DDoS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No alerts found
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const IconComponent = getIconForEvent(alert.event);
            const severityColor = getSeverityColor(alert.severity || 'Low');
            
            return (
              <div 
                key={alert.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors"
              >
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${severityColor}20` }}
                >
                  <span 
                    className="text-sm font-bold"
                    style={{ color: severityColor }}
                  >
                    {(alert.severity || 'L').charAt(0)}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground">{alert.event}</h4>
                    {getSeverityBadge(alert.severity || 'Low')}
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.source_ip}</p>
                  <p className="text-xs text-muted-foreground mt-1">{getDetailsFromEvent(alert.event)}</p>
                </div>
                
                <div className="text-xs text-muted-foreground text-right">
                  {alert.timestamp}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default AlertFeed;