export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          active: boolean
          description: string | null
          icon: string | null
          id: string
          points: number
          title: string
        }
        Insert: {
          active?: boolean
          description?: string | null
          icon?: string | null
          id?: string
          points?: number
          title: string
        }
        Update: {
          active?: boolean
          description?: string | null
          icon?: string | null
          id?: string
          points?: number
          title?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          page_url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          page_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          page_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          target_id: string | null
          target_table: string
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          target_id?: string | null
          target_table: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          target_id?: string | null
          target_table?: string
        }
        Relationships: []
      }
      admin_alerts: {
        Row: {
          alert_type: string | null
          created_at: string | null
          id: string
          message: string | null
          target_tier: string[] | null
          title: string
        }
        Insert: {
          alert_type?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          target_tier?: string[] | null
          title: string
        }
        Update: {
          alert_type?: string | null
          created_at?: string | null
          id?: string
          message?: string | null
          target_tier?: string[] | null
          title?: string
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string | null
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action?: string | null
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string | null
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      alpha_partners: {
        Row: {
          address: string
          alpha_status: string | null
          amenities: string[] | null
          atmosphere: string | null
          city: string
          country: string
          created_at: string | null
          currently_open: boolean | null
          email: string | null
          exclusive_access: string | null
          featured: boolean | null
          has_delivery: boolean | null
          hero_image: string | null
          hours_saturday: string | null
          hours_sunday: string | null
          hours_weekdays: string | null
          id: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          member_discount: string | null
          name: string
          open_for_reservations: boolean | null
          partner_since: string | null
          payment_methods: string[] | null
          phone: string | null
          rating_overall: number | null
          region: string
          review_count: number | null
          special_events: string | null
          specialties: string[] | null
          updated_at: string | null
          vibe: string | null
          website: string | null
        }
        Insert: {
          address: string
          alpha_status?: string | null
          amenities?: string[] | null
          atmosphere?: string | null
          city: string
          country?: string
          created_at?: string | null
          currently_open?: boolean | null
          email?: string | null
          exclusive_access?: string | null
          featured?: boolean | null
          has_delivery?: boolean | null
          hero_image?: string | null
          hours_saturday?: string | null
          hours_sunday?: string | null
          hours_weekdays?: string | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          member_discount?: string | null
          name: string
          open_for_reservations?: boolean | null
          partner_since?: string | null
          payment_methods?: string[] | null
          phone?: string | null
          rating_overall?: number | null
          region: string
          review_count?: number | null
          special_events?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          vibe?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          alpha_status?: string | null
          amenities?: string[] | null
          atmosphere?: string | null
          city?: string
          country?: string
          created_at?: string | null
          currently_open?: boolean | null
          email?: string | null
          exclusive_access?: string | null
          featured?: boolean | null
          has_delivery?: boolean | null
          hero_image?: string | null
          hours_saturday?: string | null
          hours_sunday?: string | null
          hours_weekdays?: string | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          member_discount?: string | null
          name?: string
          open_for_reservations?: boolean | null
          partner_since?: string | null
          payment_methods?: string[] | null
          phone?: string | null
          rating_overall?: number | null
          region?: string
          review_count?: number | null
          special_events?: string | null
          specialties?: string[] | null
          updated_at?: string | null
          vibe?: string | null
          website?: string | null
        }
        Relationships: []
      }
      art_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          downvotes: number | null
          id: string
          post_id: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          post_id?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          post_id?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "art_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "art_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "art_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      art_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string | null
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "art_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "art_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "art_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      art_posts: {
        Row: {
          artist_name: string | null
          created_at: string | null
          description: string | null
          downvotes: number | null
          id: string
          image_url: string | null
          published: boolean | null
          stars: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          artist_name?: string | null
          created_at?: string | null
          description?: string | null
          downvotes?: number | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          stars?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          artist_name?: string | null
          created_at?: string | null
          description?: string | null
          downvotes?: number | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          stars?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: []
      }
      billing_profiles: {
        Row: {
          created_at: string | null
          id: string
          payfast_customer_id: string | null
          user_id: string | null
          wallet_balance: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          payfast_customer_id?: string | null
          user_id?: string | null
          wallet_balance?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payfast_customer_id?: string | null
          user_id?: string | null
          wallet_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_interactions: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          interaction_type: string | null
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_interactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string | null
          strain_id: string | null
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          strain_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string | null
          strain_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "diary_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "user_starred_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "strains"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_name: string | null
          category: string | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          title: string
        }
        Insert: {
          author_name?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          title: string
        }
        Update: {
          author_name?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          title?: string
        }
        Relationships: []
      }
      culture_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          downvotes: number | null
          id: string
          post_id: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          post_id?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          post_id?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "culture_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "culture_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culture_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      culture_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string | null
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "culture_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "culture_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "culture_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      culture_items: {
        Row: {
          category: string
          created_at: string | null
          creator: string | null
          description: string | null
          downvotes: number | null
          feelings: Json | null
          id: string
          img_url: string | null
          medium: string | null
          name: string
          published: boolean | null
          search_vector: unknown
          slug: string | null
          stars: number | null
          type: string | null
          updated_at: string | null
          upvotes: number | null
          year: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          creator?: string | null
          description?: string | null
          downvotes?: number | null
          feelings?: Json | null
          id?: string
          img_url?: string | null
          medium?: string | null
          name: string
          published?: boolean | null
          search_vector?: unknown
          slug?: string | null
          stars?: number | null
          type?: string | null
          updated_at?: string | null
          upvotes?: number | null
          year?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          creator?: string | null
          description?: string | null
          downvotes?: number | null
          feelings?: Json | null
          id?: string
          img_url?: string | null
          medium?: string | null
          name?: string
          published?: boolean | null
          search_vector?: unknown
          slug?: string | null
          stars?: number | null
          type?: string | null
          updated_at?: string | null
          upvotes?: number | null
          year?: string | null
        }
        Relationships: []
      }
      culture_posts: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          downvotes: number | null
          id: string
          image_url: string | null
          published: boolean | null
          stars: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          downvotes?: number | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          stars?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          downvotes?: number | null
          id?: string
          image_url?: string | null
          published?: boolean | null
          stars?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          author_id: string | null
          category: string | null
          consumption_method: string | null
          content: string
          created_at: string | null
          downvotes: number | null
          excerpt: string | null
          experience_rating: number | null
          id: string
          published: boolean | null
          search_vector: unknown
          stars: number | null
          strain_id: string | null
          strain_name: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_tier: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          consumption_method?: string | null
          content: string
          created_at?: string | null
          downvotes?: number | null
          excerpt?: string | null
          experience_rating?: number | null
          id?: string
          published?: boolean | null
          search_vector?: unknown
          stars?: number | null
          strain_id?: string | null
          strain_name?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_tier?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          consumption_method?: string | null
          content?: string
          created_at?: string | null
          downvotes?: number | null
          excerpt?: string | null
          experience_rating?: number | null
          id?: string
          published?: boolean | null
          search_vector?: unknown
          stars?: number | null
          strain_id?: string | null
          strain_name?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diary_entries_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "strains"
            referencedColumns: ["id"]
          },
        ]
      }
      dropoff_locations: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          latitude: number
          longitude: number
          name: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          delivered_at: string | null
          email_type: string
          id: string
          mailerlite_campaign_id: string | null
          metadata: Json | null
          opened_at: string | null
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email_type: string
          id?: string
          mailerlite_campaign_id?: string | null
          metadata?: Json | null
          opened_at?: string | null
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          email_type?: string
          id?: string
          mailerlite_campaign_id?: string | null
          metadata?: Json | null
          opened_at?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      event_bookings: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_bookings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "member_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tickets: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          price: number
          status: string
          ticket_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          price?: number
          status?: string
          ticket_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          price?: number
          status?: string
          ticket_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "map_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          enabled: boolean
          feature_name: string
          id: string
          tier_required: string | null
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          feature_name: string
          id?: string
          tier_required?: string | null
        }
        Update: {
          created_at?: string
          enabled?: boolean
          feature_name?: string
          id?: string
          tier_required?: string | null
        }
        Relationships: []
      }
      kit_deliveries: {
        Row: {
          carrier: string | null
          created_at: string | null
          delivered_at: string | null
          estimated_delivery: string | null
          id: string
          kit_contents: Json | null
          kit_month: string
          kit_type: string
          shipped_at: string | null
          shipping_address: Json
          shipping_status: string | null
          subscription_id: string
          tracking_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          kit_contents?: Json | null
          kit_month: string
          kit_type: string
          shipped_at?: string | null
          shipping_address: Json
          shipping_status?: string | null
          subscription_id: string
          tracking_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          kit_contents?: Json | null
          kit_month?: string
          kit_type?: string
          shipped_at?: string | null
          shipping_address?: Json
          shipping_status?: string | null
          subscription_id?: string
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kit_deliveries_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_logs: {
        Row: {
          completed_at: string | null
          details: Json | null
          error_message: string | null
          id: string
          job_type: string
          records_affected: number | null
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          job_type: string
          records_affected?: number | null
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          details?: Json | null
          error_message?: string | null
          id?: string
          job_type?: string
          records_affected?: number | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      map_events: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          event_date: string | null
          event_type: string | null
          event_url: string | null
          icon_svg: string | null
          id: string
          image_url: string | null
          latitude: number
          longitude: number
          title: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_type?: string | null
          event_url?: string | null
          icon_svg?: string | null
          id?: string
          image_url?: string | null
          latitude: number
          longitude: number
          title: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          event_date?: string | null
          event_type?: string | null
          event_url?: string | null
          icon_svg?: string | null
          id?: string
          image_url?: string | null
          latitude?: number
          longitude?: number
          title?: string
        }
        Relationships: []
      }
      map_locations: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          contact_info: Json | null
          created_at: string | null
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          province: string | null
          type: string
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          province?: string | null
          type: string
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          contact_info?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          province?: string | null
          type?: string
        }
        Relationships: []
      }
      member_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          event_name: string
          id: string
          location: string
          tier_access: string[] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          event_name: string
          id?: string
          location: string
          tier_access?: string[] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_name?: string
          id?: string
          location?: string
          tier_access?: string[] | null
        }
        Relationships: []
      }
      member_rewards: {
        Row: {
          active: boolean | null
          auto_apply: boolean | null
          created_at: string | null
          description: string | null
          id: string
          reward_source: string | null
          reward_type: string | null
          title: string
          value: number | null
        }
        Insert: {
          active?: boolean | null
          auto_apply?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          reward_source?: string | null
          reward_type?: string | null
          title: string
          value?: number | null
        }
        Update: {
          active?: boolean | null
          auto_apply?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          reward_source?: string | null
          reward_type?: string | null
          title?: string
          value?: number | null
        }
        Relationships: []
      }
      moderation_queue: {
        Row: {
          content_id: string | null
          content_type: string | null
          created_at: string | null
          id: string
          reason: string | null
          reported_by: string | null
          status: string | null
        }
        Insert: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          reported_by?: string | null
          status?: string | null
        }
        Update: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string | null
          id?: string
          reason?: string | null
          reported_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_queue_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_permissions: {
        Row: {
          allow_community: boolean | null
          allow_map: boolean | null
          allow_profile: boolean | null
          allow_shop: boolean | null
          id: string
          tier: string | null
        }
        Insert: {
          allow_community?: boolean | null
          allow_map?: boolean | null
          allow_profile?: boolean | null
          allow_shop?: boolean | null
          id?: string
          tier?: string | null
        }
        Update: {
          allow_community?: boolean | null
          allow_map?: boolean | null
          allow_profile?: boolean | null
          allow_shop?: boolean | null
          id?: string
          tier?: string | null
        }
        Relationships: []
      }
      notification_types: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price_at_purchase: number | null
          product_id: string | null
          quantity: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price_at_purchase?: number | null
          product_id?: string | null
          quantity?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price_at_purchase?: number | null
          product_id?: string | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          order_number: string
          order_type: string | null
          paid_at: string | null
          payfast_merchant_id: string | null
          payfast_payment_id: string | null
          payfast_signature: string | null
          payment_metadata: Json | null
          payment_method: string | null
          payment_status: string | null
          product_name: string | null
          refund_amount: number | null
          refund_reason: string | null
          refunded_at: string | null
          subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          order_number: string
          order_type?: string | null
          paid_at?: string | null
          payfast_merchant_id?: string | null
          payfast_payment_id?: string | null
          payfast_signature?: string | null
          payment_metadata?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          product_name?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          order_number?: string
          order_type?: string | null
          paid_at?: string | null
          payfast_merchant_id?: string | null
          payfast_payment_id?: string | null
          payfast_signature?: string | null
          payment_metadata?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          product_name?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refunded_at?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_hours: {
        Row: {
          close_time: string | null
          day_of_week: number
          id: string
          is_closed: boolean
          open_time: string | null
          partner_id: string
        }
        Insert: {
          close_time?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
          partner_id: string
        }
        Update: {
          close_time?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
          partner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_hours_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "alpha_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_inventory: {
        Row: {
          id: string
          low_stock_threshold: number | null
          partner_id: string | null
          product_id: string | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          low_stock_threshold?: number | null
          partner_id?: string | null
          product_id?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          low_stock_threshold?: number | null
          partner_id?: string | null
          product_id?: string | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_inventory_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "alpha_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "partner_products"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_locations: {
        Row: {
          active: boolean | null
          address: string | null
          category: string | null
          created_at: string | null
          description: string | null
          features: string[] | null
          hours: string | null
          id: string
          image_url: string | null
          latitude: number
          longitude: number
          name: string
          phone: string | null
          updated_at: string | null
          verified: boolean | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          hours?: string | null
          id?: string
          image_url?: string | null
          latitude: number
          longitude: number
          name: string
          phone?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          hours?: string | null
          id?: string
          image_url?: string | null
          latitude?: number
          longitude?: number
          name?: string
          phone?: string | null
          updated_at?: string | null
          verified?: boolean | null
        }
        Relationships: []
      }
      partner_metrics: {
        Row: {
          orders: number | null
          partner_id: string
          product_clicks: number | null
          profile_views: number | null
          updated_at: string | null
        }
        Insert: {
          orders?: number | null
          partner_id: string
          product_clicks?: number | null
          profile_views?: number | null
          updated_at?: string | null
        }
        Update: {
          orders?: number | null
          partner_id?: string
          product_clicks?: number | null
          profile_views?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_metrics_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: true
            referencedRelation: "alpha_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_products: {
        Row: {
          category: string | null
          cbd_percentage: number | null
          created_at: string | null
          description: string | null
          effects: string[] | null
          flavors: string[] | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          name: string
          partner_id: string
          price: number | null
          price_unit: string | null
          stock_quantity: number | null
          strain_type: string | null
          thc_percentage: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          cbd_percentage?: number | null
          created_at?: string | null
          description?: string | null
          effects?: string[] | null
          flavors?: string[] | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name: string
          partner_id: string
          price?: number | null
          price_unit?: string | null
          stock_quantity?: number | null
          strain_type?: string | null
          thc_percentage?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          cbd_percentage?: number | null
          created_at?: string | null
          description?: string | null
          effects?: string[] | null
          flavors?: string[] | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name?: string
          partner_id?: string
          price?: number | null
          price_unit?: string | null
          stock_quantity?: number | null
          strain_type?: string | null
          thc_percentage?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_products_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "alpha_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          payfast_payment_id: string | null
          provider: string | null
          raw_response: Json | null
          reference: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          payfast_payment_id?: string | null
          provider?: string | null
          raw_response?: Json | null
          reference?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          payfast_payment_id?: string | null
          provider?: string | null
          raw_response?: Json | null
          reference?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_diary_entries: {
        Row: {
          created_at: string | null
          entry_date: string
          experience_notes: string | null
          id: string
          rating: number | null
          strain_name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entry_date?: string
          experience_notes?: string | null
          id?: string
          rating?: number | null
          strain_name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entry_date?: string
          experience_notes?: string | null
          id?: string
          rating?: number | null
          strain_name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      platform_metrics: {
        Row: {
          active_subscriptions: number
          created_at: string
          id: string
          metadata: Json | null
          new_signups_today: number
          pending_applications: number
          revenue_total: number
          snapshot_date: string
          total_culture_items: number
          total_diary_entries: number
          total_orders: number
          total_products: number
          total_strains: number
          total_users: number
        }
        Insert: {
          active_subscriptions?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          new_signups_today?: number
          pending_applications?: number
          revenue_total?: number
          snapshot_date?: string
          total_culture_items?: number
          total_diary_entries?: number
          total_orders?: number
          total_products?: number
          total_strains?: number
          total_users?: number
        }
        Update: {
          active_subscriptions?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          new_signups_today?: number
          pending_applications?: number
          revenue_total?: number
          snapshot_date?: string
          total_culture_items?: number
          total_diary_entries?: number
          total_orders?: number
          total_products?: number
          total_strains?: number
          total_users?: number
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          culture_item_id: string | null
          downvotes: number | null
          id: string
          parent_comment_id: string | null
          post_id: string | null
          strain_id: string | null
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          culture_item_id?: string | null
          downvotes?: number | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string | null
          strain_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          culture_item_id?: string | null
          downvotes?: number | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string | null
          strain_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_culture_item_id_fkey"
            columns: ["culture_item_id"]
            isOneToOne: false
            referencedRelation: "culture_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "diary_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "user_starred_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "strains"
            referencedColumns: ["id"]
          },
        ]
      }
      post_interactions: {
        Row: {
          created_at: string | null
          culture_item_id: string | null
          id: string
          interaction_type: string | null
          post_id: string | null
          strain_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          culture_item_id?: string | null
          id?: string
          interaction_type?: string | null
          post_id?: string | null
          strain_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          culture_item_id?: string | null
          id?: string
          interaction_type?: string | null
          post_id?: string | null
          strain_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_interactions_culture_item_id_fkey"
            columns: ["culture_item_id"]
            isOneToOne: false
            referencedRelation: "culture_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_interactions_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "strains"
            referencedColumns: ["id"]
          },
        ]
      }
      private_member_applications: {
        Row: {
          application_status: string | null
          created_at: string | null
          id: string
          instagram_handle: string | null
          interests: string | null
          motivation: string
          profession: string | null
          referred_by: string | null
          rejection_reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_status?: string | null
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          interests?: string | null
          motivation: string
          profession?: string | null
          referred_by?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_status?: string | null
          created_at?: string | null
          id?: string
          instagram_handle?: string | null
          interests?: string | null
          motivation?: string
          profession?: string | null
          referred_by?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      private_membership_applications: {
        Row: {
          additional_info: string | null
          admin_notes: string | null
          created_at: string | null
          id: string
          motivation_text: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          additional_info?: string | null
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          motivation_text: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          additional_info?: string | null
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          motivation_text?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          rating: number | null
          review_text: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
          review_text?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          rating?: number | null
          review_text?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "partner_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_views: {
        Row: {
          id: string
          product_id: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          name: string
          price: number
          search_vector: unknown
          stock_quantity: number
          trending: boolean | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name: string
          price: number
          search_vector?: unknown
          stock_quantity?: number
          trending?: boolean | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name?: string
          price?: number
          search_vector?: unknown
          stock_quantity?: number
          trending?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          application_status: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          payment_status: string | null
          phone: string | null
          preferences: Json | null
          referral_code_used: string | null
          role: string | null
          subscription_tier: string | null
          tier: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          application_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          payment_status?: string | null
          phone?: string | null
          preferences?: Json | null
          referral_code_used?: string | null
          role?: string | null
          subscription_tier?: string | null
          tier?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          application_status?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          payment_status?: string | null
          phone?: string | null
          preferences?: Json | null
          referral_code_used?: string | null
          role?: string | null
          subscription_tier?: string | null
          tier?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      promo_code_redemptions: {
        Row: {
          id: string
          promo_code: string
          redeemed_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          promo_code: string
          redeemed_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          promo_code?: string
          redeemed_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          current_uses: number | null
          expires_at: string | null
          id: string
          max_uses: number | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referred_user_id: string | null
          referrer_id: string | null
          reward_granted: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referred_user_id?: string | null
          referrer_id?: string | null
          reward_granted?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referred_user_id?: string | null
          referrer_id?: string | null
          reward_granted?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_claims: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reward_id: string
          status: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reward_id: string
          status?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reward_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_claims_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "member_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          section: string | null
          updated_at: string | null
          updated_by: string | null
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          section?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          section?: string | null
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      store_suggestions: {
        Row: {
          address: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          store_name: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          store_name: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          store_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_suggestions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      strains: {
        Row: {
          created_at: string | null
          description: string | null
          downvotes: number | null
          effects: Json | null
          id: string
          img_url: string | null
          most_common_terpene: string | null
          name: string
          overall_rating: number | null
          published: boolean | null
          search_vector: unknown
          slug: string | null
          stars: number | null
          thc_level: string | null
          total_reviews: number | null
          type: string | null
          updated_at: string | null
          upvotes: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          downvotes?: number | null
          effects?: Json | null
          id?: string
          img_url?: string | null
          most_common_terpene?: string | null
          name: string
          overall_rating?: number | null
          published?: boolean | null
          search_vector?: unknown
          slug?: string | null
          stars?: number | null
          thc_level?: string | null
          total_reviews?: number | null
          type?: string | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          downvotes?: number | null
          effects?: Json | null
          id?: string
          img_url?: string | null
          most_common_terpene?: string | null
          name?: string
          overall_rating?: number | null
          published?: boolean | null
          search_vector?: unknown
          slug?: string | null
          stars?: number | null
          thc_level?: string | null
          total_reviews?: number | null
          type?: string | null
          updated_at?: string | null
          upvotes?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          billing_cycle: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          is_trial: boolean | null
          next_billing_date: string | null
          payfast_frequency: number | null
          payfast_subscription_token: string | null
          start_date: string
          status: string | null
          tier: string
          trial_end_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          is_trial?: boolean | null
          next_billing_date?: string | null
          payfast_frequency?: number | null
          payfast_subscription_token?: string | null
          start_date?: string
          status?: string | null
          tier: string
          trial_end_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          is_trial?: boolean | null
          next_billing_date?: string | null
          payfast_frequency?: number | null
          payfast_subscription_token?: string | null
          start_date?: string
          status?: string | null
          tier?: string
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      support_requests: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          status: string | null
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          status: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tier_change_requests: {
        Row: {
          created_at: string | null
          id: string
          requested_tier: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          requested_tier?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          requested_tier?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tier_change_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string | null
          earned_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          achievement_id?: string | null
          earned_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          achievement_id?: string | null
          earned_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_alert_reads: {
        Row: {
          alert_id: string
          id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          alert_id: string
          id?: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          alert_id?: string
          id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_alert_reads_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "admin_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cart: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_cart_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_deliveries: {
        Row: {
          admin_notes: string | null
          concierge: boolean | null
          created_at: string | null
          delivered_at: string | null
          delivery_address: string | null
          delivery_fee: number | null
          delivery_fee_original: number | null
          distance_km: number | null
          driver_latitude: number | null
          driver_longitude: number | null
          driver_name: string | null
          driver_phone: string | null
          estimated_delivery: string | null
          eta_minutes: number | null
          geofence_arrived_at: string | null
          geofence_left_at: string | null
          id: string
          order_id: string | null
          pickup_address: string | null
          pod_photo_url: string | null
          pod_signature_url: string | null
          priority: string | null
          provider: string | null
          raw_shipday_payload: Json | null
          shipday_last_sync: string | null
          shipday_order_id: string | null
          shipday_status: string | null
          status: string | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          concierge?: boolean | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          delivery_fee_original?: number | null
          distance_km?: number | null
          driver_latitude?: number | null
          driver_longitude?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          estimated_delivery?: string | null
          eta_minutes?: number | null
          geofence_arrived_at?: string | null
          geofence_left_at?: string | null
          id?: string
          order_id?: string | null
          pickup_address?: string | null
          pod_photo_url?: string | null
          pod_signature_url?: string | null
          priority?: string | null
          provider?: string | null
          raw_shipday_payload?: Json | null
          shipday_last_sync?: string | null
          shipday_order_id?: string | null
          shipday_status?: string | null
          status?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          concierge?: boolean | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          delivery_fee_original?: number | null
          distance_km?: number | null
          driver_latitude?: number | null
          driver_longitude?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          estimated_delivery?: string | null
          eta_minutes?: number | null
          geofence_arrived_at?: string | null
          geofence_left_at?: string | null
          id?: string
          order_id?: string | null
          pickup_address?: string | null
          pod_photo_url?: string | null
          pod_signature_url?: string | null
          priority?: string | null
          provider?: string | null
          raw_shipday_payload?: Json | null
          shipday_last_sync?: string | null
          shipday_order_id?: string | null
          shipday_status?: string | null
          status?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_diary: {
        Row: {
          created_at: string | null
          entry_text: string | null
          id: string
          mood: string | null
          points_earned: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          entry_text?: string | null
          id?: string
          mood?: string | null
          points_earned?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          entry_text?: string | null
          id?: string
          mood?: string | null
          points_earned?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_diary_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          channel: string
          created_at: string
          enabled: boolean
          id: string
          notification_type_id: string | null
          user_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          enabled?: boolean
          id?: string
          notification_type_id?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          enabled?: boolean
          id?: string
          notification_type_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_preferences_notification_type_id_fkey"
            columns: ["notification_type_id"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_settings: {
        Row: {
          enabled: boolean
          notification_type_id: string
          user_id: string
        }
        Insert: {
          enabled?: boolean
          notification_type_id: string
          user_id: string
        }
        Update: {
          enabled?: boolean
          notification_type_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_settings_notification_type_id_fkey"
            columns: ["notification_type_id"]
            isOneToOne: false
            referencedRelation: "notification_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          seen: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          seen?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          seen?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          community_notifications: boolean | null
          created_at: string | null
          data_optimization_consent: boolean | null
          id: string
          interests: Json | null
          marketing_emails: boolean | null
          music_genres: Json | null
          preferred_contact_method: string | null
          style_preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          community_notifications?: boolean | null
          created_at?: string | null
          data_optimization_consent?: boolean | null
          id?: string
          interests?: Json | null
          marketing_emails?: boolean | null
          music_genres?: Json | null
          preferred_contact_method?: string | null
          style_preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          community_notifications?: boolean | null
          created_at?: string | null
          data_optimization_consent?: boolean | null
          id?: string
          interests?: Json | null
          marketing_emails?: boolean | null
          music_genres?: Json | null
          preferred_contact_method?: string | null
          style_preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_recommendations: {
        Row: {
          created_at: string
          id: string
          recommendation_type: string
          score: number
          target_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          recommendation_type: string
          score?: number
          target_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          recommendation_type?: string
          score?: number
          target_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          claimed: boolean | null
          claimed_at: string | null
          id: string
          reward_id: string | null
          user_id: string | null
        }
        Insert: {
          claimed?: boolean | null
          claimed_at?: string | null
          id?: string
          reward_id?: string | null
          user_id?: string | null
        }
        Update: {
          claimed?: boolean | null
          claimed_at?: string | null
          id?: string
          reward_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_rewards_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "member_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          id: string
          ip_address: string | null
          location: string | null
          login_time: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          location?: string | null
          login_time?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          location?: string | null
          login_time?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wallet: {
        Row: {
          created_at: string | null
          credit_balance: number | null
          id: string
          token_balance: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credit_balance?: number | null
          id?: string
          token_balance?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credit_balance?: number | null
          id?: string
          token_balance?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_wallet_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          concierge_eligible: boolean | null
          created_at: string | null
          dashboard_locked: boolean | null
          delivery_address: string | null
          delivery_preferences: Json | null
          diary_entry_count: number | null
          diary_points: number | null
          dob: string | null
          email: string
          free_deliveries_reset_month: string | null
          free_deliveries_used: number | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          last_diary_entry: string | null
          last_entry_date: string | null
          last_login_at: string | null
          last_visit_at: string | null
          longest_streak: number | null
          notify_events: boolean | null
          notify_orders: boolean | null
          notify_promotions: boolean | null
          phone_number: string | null
          profile_public: boolean | null
          show_activity: boolean | null
          signup_completed: boolean | null
          signup_step: string | null
          streak_count: number | null
          tier: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          concierge_eligible?: boolean | null
          created_at?: string | null
          dashboard_locked?: boolean | null
          delivery_address?: string | null
          delivery_preferences?: Json | null
          diary_entry_count?: number | null
          diary_points?: number | null
          dob?: string | null
          email: string
          free_deliveries_reset_month?: string | null
          free_deliveries_used?: number | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          last_diary_entry?: string | null
          last_entry_date?: string | null
          last_login_at?: string | null
          last_visit_at?: string | null
          longest_streak?: number | null
          notify_events?: boolean | null
          notify_orders?: boolean | null
          notify_promotions?: boolean | null
          phone_number?: string | null
          profile_public?: boolean | null
          show_activity?: boolean | null
          signup_completed?: boolean | null
          signup_step?: string | null
          streak_count?: number | null
          tier?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          concierge_eligible?: boolean | null
          created_at?: string | null
          dashboard_locked?: boolean | null
          delivery_address?: string | null
          delivery_preferences?: Json | null
          diary_entry_count?: number | null
          diary_points?: number | null
          dob?: string | null
          email?: string
          free_deliveries_reset_month?: string | null
          free_deliveries_used?: number | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          last_diary_entry?: string | null
          last_entry_date?: string | null
          last_login_at?: string | null
          last_visit_at?: string | null
          longest_streak?: number | null
          notify_events?: boolean | null
          notify_orders?: boolean | null
          notify_promotions?: boolean | null
          phone_number?: string | null
          profile_public?: boolean | null
          show_activity?: boolean | null
          signup_completed?: boolean | null
          signup_step?: string | null
          streak_count?: number | null
          tier?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      vendor_accounts: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          is_active: boolean | null
          partner_id: string
          permissions: Json | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          partner_id: string
          permissions?: Json | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          partner_id?: string
          permissions?: Json | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_accounts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "alpha_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_applications: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          message: string | null
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role_requested: string
          status: string
          store_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_requested?: string
          status?: string
          store_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_requested?: string
          status?: string
          store_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_applications_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "alpha_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_invitations: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          invited_by: string | null
          partner_id: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          invited_by?: string | null
          partner_id?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          invited_by?: string | null
          partner_id?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_invitations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "alpha_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_payouts: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          partner_id: string | null
          payout_method: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payout_status"]
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          partner_id?: string | null
          payout_method?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          partner_id?: string | null
          payout_method?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "alpha_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_submissions: {
        Row: {
          address: string
          created_at: string | null
          description: string | null
          id: string
          phone: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role_requested: string
          status: string | null
          user_id: string | null
          vendor_name: string
        }
        Insert: {
          address: string
          created_at?: string | null
          description?: string | null
          id?: string
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_requested?: string
          status?: string | null
          user_id?: string | null
          vendor_name: string
        }
        Update: {
          address?: string
          created_at?: string | null
          description?: string | null
          id?: string
          phone?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_requested?: string
          status?: string | null
          user_id?: string | null
          vendor_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      product_views_daily: {
        Row: {
          day: string | null
          product_id: string | null
          views: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_starred_posts: {
        Row: {
          author_id: string | null
          category: string | null
          consumption_method: string | null
          content: string | null
          created_at: string | null
          downvotes: number | null
          excerpt: string | null
          experience_rating: number | null
          id: string | null
          published: boolean | null
          search_vector: unknown
          stars: number | null
          strain_id: string | null
          strain_name: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diary_entries_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "strains"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      approve_store_suggestion: {
        Args: { admin_id: string; suggestion_id: string }
        Returns: undefined
      }
      current_user_id: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      has_role:
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
        | { Args: { required_role: string }; Returns: boolean }
      is_user_age_verified: {
        Args: { user_date_of_birth: string }
        Returns: boolean
      }
      parse_percentage: { Args: { value: string }; Returns: number }
      refresh_product_views_daily: { Args: never; Returns: undefined }
      set_admin_for_email: {
        Args: { make_admin: boolean; target_email: string }
        Returns: undefined
      }
      validate_referral_code: { Args: { code_input: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      payout_status: "pending" | "processing" | "paid" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      payout_status: ["pending", "processing", "paid", "failed"],
    },
  },
} as const
