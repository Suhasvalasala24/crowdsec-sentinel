import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Alert {
  id: string;
  event: string;
  source_ip: string;
  timestamp: string;
  severity: string;
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getSeverityFromEvent = (event: string): string => {
    const eventLower = event.toLowerCase();
    if (eventLower.includes('ssh') || eventLower.includes('bruteforce')) return 'Critical';
    if (eventLower.includes('ddos') || eventLower.includes('dos')) return 'Ddos';
    if (eventLower.includes('scan') || eventLower.includes('exploit')) return 'High';
    if (eventLower.includes('suspicious')) return 'Medium';
    return 'Low';
  };

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      console.log('Fetching alerts from Supabase...');
      const { data, error } = await supabase
        .from('alerts') // ✅ No generics, avoids TS errors
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      console.log('Supabase alerts:', data);

      const transformedAlerts: Alert[] = (data || []).map((alert: any) => ({
        id: alert.id.toString(),
        event: alert.event,
        source_ip: alert.source_ip,
        timestamp: new Date(alert.timestamp).toLocaleString(),
        severity: getSeverityFromEvent(alert.event)
      }));

      setAlerts(transformedAlerts);
    } catch (error) {
      console.error('Error fetching alerts from Supabase:', error);
      toast({
        title: "Error",
        description: "Failed to fetch alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          const newAlert: Alert = {
            id: payload.new.id.toString(),
            event: payload.new.event,
            source_ip: payload.new.source_ip,
            timestamp: new Date(payload.new.timestamp).toLocaleString(),
            severity: getSeverityFromEvent(payload.new.event)
          };
          setAlerts(prev => [newAlert, ...prev.slice(0, 99)]);
          toast({
            title: "New Alert",
            description: `${newAlert.event} from ${newAlert.source_ip}`,
          });
        }
      )
      .subscribe();

    const interval = setInterval(fetchAlerts, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return { alerts, loading, refetch: fetchAlerts };
};