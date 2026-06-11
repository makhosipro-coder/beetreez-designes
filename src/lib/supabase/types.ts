export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      designs: {
        Row: {
          id: string;
          author_id: string;
          name: string;
          team_id: string | null;
          thumbnail: string | null;
          project_type: string;
          layer_state: Json;
          design_metadata: Json;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          author_id: string;
          name: string;
          team_id?: string | null;
          thumbnail?: string | null;
          project_type?: string;
          layer_state: Json;
          design_metadata: Json;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          name?: string;
          team_id?: string | null;
          thumbnail?: string | null;
          project_type?: string;
          layer_state?: Json;
          design_metadata?: Json;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "designs_author_id_fkey"; columns: ["author_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          { foreignKeyName: "designs_team_id_fkey"; columns: ["team_id"]; referencedRelation: "teams"; referencedColumns: ["id"] }
        ];
      };
      folders: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          user_id: string;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          parent_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "folders_parent_id_fkey"; columns: ["parent_id"]; referencedRelation: "folders"; referencedColumns: ["id"] },
          { foreignKeyName: "folders_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      published_snapshots: {
        Row: {
          id: string;
          design_id: string;
          author_email: string;
          layer_state: Json;
          title: string;
          description: string;
          visibility: string;
          created_at: string;
        };
        Insert: {
          id: string;
          design_id: string;
          author_email: string;
          layer_state: Json;
          title?: string;
          description?: string;
          visibility?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          design_id?: string;
          author_email?: string;
          layer_state?: Json;
          title?: string;
          description?: string;
          visibility?: string;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "published_snapshots_design_id_fkey"; columns: ["design_id"]; referencedRelation: "designs"; referencedColumns: ["id"] }
        ];
      };
      team_members: {
        Row: {
          team_id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          team_id: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          team_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "team_members_team_id_fkey"; columns: ["team_id"]; referencedRelation: "teams"; referencedColumns: ["id"] },
          { foreignKeyName: "team_members_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          owner_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          created_at?: string;
        };
        Relationships: [
          { foreignKeyName: "teams_owner_id_fkey"; columns: ["owner_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] }
        ];
      };
      tickets_windows_screens: {
        Row: {
          id: string;
          design_id: string;
          service_type: string;
          exact_dimensions_mm: Json;
          material_type: string;
          assigned_fabricator_id: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          design_id: string;
          service_type: string;
          exact_dimensions_mm?: Json;
          material_type?: string;
          assigned_fabricator_id?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          design_id?: string;
          service_type?: string;
          exact_dimensions_mm?: Json;
          material_type?: string;
          assigned_fabricator_id?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "tickets_windows_screens_design_id_fkey"; columns: ["design_id"]; referencedRelation: "designs"; referencedColumns: ["id"] }
        ];
      };
      transit_shipments: {
        Row: {
          id: string;
          design_id: string;
          carrier_id: string;
          carrier_name: string;
          tracking_number: string | null;
          package_weight_kg: number;
          cargo_status: string;
          current_eta: Json | null;
          origin: string | null;
          destination: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          design_id: string;
          carrier_id: string;
          carrier_name?: string;
          tracking_number?: string | null;
          package_weight_kg?: number;
          cargo_status?: string;
          current_eta?: Json | null;
          origin?: string | null;
          destination?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          design_id?: string;
          carrier_id?: string;
          carrier_name?: string;
          tracking_number?: string | null;
          package_weight_kg?: number;
          cargo_status?: string;
          current_eta?: Json | null;
          origin?: string | null;
          destination?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          { foreignKeyName: "transit_shipments_design_id_fkey"; columns: ["design_id"]; referencedRelation: "designs"; referencedColumns: ["id"] }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
