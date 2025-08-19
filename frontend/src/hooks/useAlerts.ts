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

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Alert {
  id: string;
  event: string;
  source_ip: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  location?: {
    lat: number;
    lng: number;
    country: string;
  };
}

interface SupabaseAlert {
  id: number;
  event: string;
  source_ip: string;
  timestamp: string;
}

const getSeverityFromEvent = (event: string): 'low' | 'medium' | 'high' => {
  const lowEvents = ['ssh-slow-bruteforce', 'http-crawl-non_statics'];
  const highEvents = ['ssh-bruteforce', 'http-bad-user-agent', 'http-crawl', 'ddos'];
  
  if (highEvents.some(e => event.toLowerCase().includes(e))) return 'high';
  if (lowEvents.some(e => event.toLowerCase().includes(e))) return 'medium';
  return 'low';
};

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAlerts = async () => {
    try {
      // First try to fetch from your FastAPI backend
      const response = await fetch('/api/alerts');
      if (response.ok) {
        const backendAlerts = await response.json();
        const transformedAlerts = backendAlerts.map((alert: any) => ({
          id: alert.id?.toString() || Math.random().toString(),
          event: alert.event || 'Unknown Event',
          source_ip: alert.source_ip || 'Unknown IP',
          timestamp: new Date(alert.timestamp).toLocaleString(),
          severity: getSeverityFromEvent(alert.event || 'Unknown Event')
        }));
        setAlerts(transformedAlerts);
        return;
      }
    } catch (error) {
      console.error('Error fetching from backend:', error);
    }

    try {
      // Fallback to Supabase direct query
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      const transformedAlerts = (data || []).map(alert => ({
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

    // Set up real-time subscription for new alerts
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
          setAlerts(prev => [newAlert, ...prev.slice(0, 99)]); // Keep last 100 alerts
          toast({
            title: "New Alert",
            description: `${newAlert.event} from ${newAlert.source_ip}`,
          });
        }
      )
      .subscribe();

    // Also set up periodic refresh to catch any missed alerts
    const refreshInterval = setInterval(fetchAlerts, 30000); // Refresh every 30 seconds

    return () => {
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, []);

  return { alerts, loading, refetch: fetchAlerts };
};