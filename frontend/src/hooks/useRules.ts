import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// -----------------------------
// Types
// -----------------------------
export type RuleType = "detection" | "prevention" | "response";
export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface Rule {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  rule_content: string;
  rule_type: RuleType;
  severity: Severity;
  tags: string[] | null;
  downloads_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// -----------------------------
// Hook
// -----------------------------
export const useRules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch public rules
  const fetchRules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("rules") // ✅ no generic to avoid TS errors
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRules((data || []).map((r: any) => ({
        ...r,
        rule_type: r.rule_type as RuleType,
        severity: r.severity as Severity,
        tags: r.tags || [],
      })));
    } catch (err) {
      console.error("Error fetching rules:", err);
    } finally {
      setLoading(false);
    }
  };

  // Upload a new rule
  const uploadRule = async (
    rule: Omit<Rule, "id" | "downloads_count" | "created_at" | "updated_at" | "is_public">
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");

    const { error } = await supabase.from("rules").insert({
      ...rule,
      user_id: user.id,
      is_public: true, // optional: default public
    });

    if (error) {
      console.error("Error uploading rule:", error);
      throw error;
    }

    await fetchRules();
  };

  // Download a rule and track count
  const downloadRule = async (ruleId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not logged in");

    // Track download
    const { error: downloadError } = await supabase.from("rule_downloads").insert({
      rule_id: ruleId,
      user_id: user.id,
    });

    if (downloadError) console.error("Error tracking download:", downloadError);

    // Increment downloads_count via RPC
    const { error: countError } = await supabase.rpc("increment_rule_downloads", { rule_id_input: ruleId });
    if (countError) console.error("Error incrementing downloads:", countError);

    await fetchRules();
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return { rules, loading, uploadRule, downloadRule };
};
