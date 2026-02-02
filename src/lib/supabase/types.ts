/**
 * Database types for Supabase
 * Generated based on BloomFlora schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// =====================================================
// Custom Types for JSONB fields
// =====================================================

export interface SeoConfig {
  title?: string;
  description?: string;
  ogImage?: string;
}

export interface BlockConfig {
  id: string;
  type: string; // e.g., 'hero.v1', 'richText.v1'
  order: number;
  enabled: boolean;
  config: Record<string, unknown>;
  visibility?: {
    hideOnMobile?: boolean;
    hideOnDesktop?: boolean;
  };
}

export interface ThemeTokens {
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    border: string;
    input: string;
    ring: string;
  };
  radius: string;
  shadow: string;
}

export interface MediaItem {
  id: string;
  path: string;
  alt?: string;
}

export interface WhatsAppSettings {
  url: string;
  enabled: boolean;
}

export interface ContactSettings {
  email: string;
  phone: string;
  address: string;
}

// =====================================================
// Database Schema Types
// =====================================================

export interface Database {
  public: {
    Tables: {
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          status: 'draft' | 'published';
          is_homepage: boolean;
          seo_title: string | null;
          seo_description: string | null;
          seo: SeoConfig;
          blocks: BlockConfig[];
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          status?: 'draft' | 'published';
          is_homepage?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          seo?: SeoConfig;
          blocks?: BlockConfig[];
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          status?: 'draft' | 'published';
          is_homepage?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          seo?: SeoConfig;
          blocks?: BlockConfig[];
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      theme: {
        Row: {
          id: string;
          name: string;
          tokens: ThemeTokens;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          tokens?: ThemeTokens;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          tokens?: ThemeTokens;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number | null;
          image_url: string | null;
          category_id: string | null;
          is_active: boolean;
          is_featured: boolean;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price?: number | null;
          image_url?: string | null;
          category_id?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number | null;
          image_url?: string | null;
          category_id?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          item_ids: string[];
          is_active: boolean;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          item_ids?: string[];
          is_active?: boolean;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          item_ids?: string[];
          is_active?: boolean;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      media: {
        Row: {
          id: string;
          path: string;
          filename: string;
          alt_text: string | null;
          mime_type: string | null;
          size: number | null;
          width: number | null;
          height: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          path: string;
          filename: string;
          alt_text?: string | null;
          mime_type?: string | null;
          size?: number | null;
          width?: number | null;
          height?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          path?: string;
          filename?: string;
          alt_text?: string | null;
          mime_type?: string | null;
          size?: number | null;
          width?: number | null;
          height?: number | null;
          created_at?: string;
        };
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      page_status: 'draft' | 'published';
      item_status: 'draft' | 'published';
    };
  };
}

// =====================================================
// Helper Types
// =====================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// Shorthand types
export type Page = Tables<'pages'>;
export type Theme = Tables<'theme'>;
export type Category = Tables<'categories'>;
export type Item = Tables<'items'>;
export type Collection = Tables<'collections'>;
export type Media = Tables<'media'>;
export type SiteSetting = Tables<'site_settings'>;
