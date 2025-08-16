import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Rule {
  id: string;
  title: string;
  description: string | null;
  rule_type: string;
  severity: string;
  downloads_count: number;
  created_at: string;
  user_id: string | null;
}

interface SupabaseRule {
  id: string;
  title: string;
  description: string | null;
  rule_type: string;
  severity: string;
  downloads_count: number;
  created_at: string;
  user_id: string | null;
  is_public: boolean;
}

export const useRules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('rules' as any)
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules((data as SupabaseRule[]) || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch community rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadRule = async (ruleData: {
    title: string;
    description: string;
    rule_content: string;
    rule_type: string;
    severity: string;
    tags?: string[];
  }) => {
    try {
      const { data, error } = await supabase
        .from('rules' as any)
        .insert([{
          ...ruleData,
          user_id: null // For now, no auth
        }])
        .select()
        .single();

      if (error) throw error;
      
      setRules(prev => [data as SupabaseRule, ...prev]);
      toast({
        title: "Success",
        description: "Rule uploaded successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error uploading rule:', error);
      toast({
        title: "Error",
        description: "Failed to upload rule",
        variant: "destructive",
      });
      throw error;
    }
  };

  const downloadRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('rule_downloads' as any)
        .insert([{
          rule_id: ruleId,
          user_id: null // For now, no auth
        }]);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Rule downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading rule:', error);
      toast({
        title: "Error",
        description: "Failed to record download",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRules();

    // Set up real-time subscription
    const channel = supabase
      .channel('rules-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rules'
        },
        (payload) => {
          if (payload.new.is_public) {
            setRules(prev => [payload.new as Rule, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { rules, loading, uploadRule, downloadRule, refetch: fetchRules };
};