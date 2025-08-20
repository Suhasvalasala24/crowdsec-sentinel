export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// --- Database type with alerts table ---
export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      alerts: {
        Row: {
          id: number;
          event: string;
          source_ip: string;
          timestamp: string;
        };
        Insert: {
          event: string;
          source_ip: string;
          timestamp?: string;
        };
        Update: {
          event?: string;
          source_ip?: string;
          timestamp?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

// Remove internal metadata
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals["public"];

// ---------------- Helper Types ----------------

export type Tables<
  TableName extends keyof DefaultSchema["Tables"] | keyof DefaultSchema["Views"]
> = TableName extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][TableName]["Row"]
  : TableName extends keyof DefaultSchema["Views"]
  ? DefaultSchema["Views"][TableName]["Row"]
  : never;

export type TablesInsert<
  TableName extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][TableName]["Update"];

export type Enums<EnumName extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][EnumName];

export type CompositeTypes<CompositeName extends keyof DefaultSchema["CompositeTypes"]> =
  DefaultSchema["CompositeTypes"][CompositeName];

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
