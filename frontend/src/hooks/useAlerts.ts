import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Alert {
  id: string;
  event: string;
  source_ip: string;
  timestamp: string;
  severity?: string;
}

interface SupabaseAlert {
  id: number;
  event: string;
  source_ip: string;
  timestamp: string;
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    try {
      // Mock data for now until Supabase types are properly set up
      const mockAlerts = [
        { id: 1, event: 'SSH Bruteforce', source_ip: '205.0.113.1', timestamp: new Date().toISOString() },
        { id: 2, event: 'Web Scan', source_ip: '192.0.2.45', timestamp: new Date().toISOString() },
        { id: 3, event: 'DDoS Attempt', source_ip: '188.51.100.23', timestamp: new Date().toISOString() },
        { id: 4, event: 'Port Scan', source_ip: '202.0.113.55', timestamp: new Date().toISOString() }
      ];
      
      const transformedAlerts = mockAlerts.map(alert => ({
        id: alert.id.toString(),
        event: alert.event,
        source_ip: alert.source_ip,
        timestamp: new Date(alert.timestamp).toLocaleString(),
        severity: getSeverityFromEvent(alert.event)
      }));

      setAlerts(transformedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityFromEvent = (event: string): string => {
    const eventLower = event.toLowerCase();
    if (eventLower.includes('ssh') || eventLower.includes('bruteforce')) return 'Critical';
    if (eventLower.includes('ddos') || eventLower.includes('dos')) return 'Ddos';
    if (eventLower.includes('scan') || eventLower.includes('exploit')) return 'High';
    if (eventLower.includes('suspicious')) return 'Medium';
    return 'Low';
  };

  useEffect(() => {
    fetchAlerts();

    // Set up real-time subscription
    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          const newAlert = {
            id: payload.new.id.toString(),
            event: payload.new.event,
            source_ip: payload.new.source_ip,
            timestamp: new Date(payload.new.timestamp).toLocaleString(),
            severity: getSeverityFromEvent(payload.new.event)
          };
          setAlerts(prev => [newAlert, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { alerts, loading, refetch: fetchAlerts };
};