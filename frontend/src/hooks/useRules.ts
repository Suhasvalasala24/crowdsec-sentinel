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
  tags: string[];
  created_at: string;
  user_id: string | null;
  is_public: boolean;
}

export const useRules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rules') // no <Rule> generic
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules((data as Rule[]) || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch community rules',
        variant: 'destructive',
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
        .from('rules')
        .insert([{
          ...ruleData,
          tags: ruleData.tags || [],
          downloads_count: 0,
          user_id: null,
          is_public: true,
        }])
        .select()
        .single();

      if (error) throw error;

      setRules(prev => [data as Rule, ...prev]);
      toast({
        title: 'Success',
        description: 'Rule uploaded successfully',
      });
      return data;
    } catch (error) {
      console.error('Error uploading rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload rule',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const downloadRule = async (ruleId: string) => {
    try {
      await supabase
        .from('rules_download')
        .insert([{ rule_id: ruleId, user_id: null }]);

      toast({
        title: 'Success',
        description: 'Rule downloaded successfully',
      });
    } catch (error) {
      console.error('Error recording download:', error);
      toast({
        title: 'Error',
        description: 'Failed to record download',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchRules();

    const channel = supabase
      .channel('rules-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rules' },
        (payload: any) => {
          const newRule = payload.new as Rule;
          if (newRule.is_public) {
            setRules(prev => [newRule, ...prev]);
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
