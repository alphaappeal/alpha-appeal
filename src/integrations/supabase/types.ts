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
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "comment_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
            foreignKeyName: "comments_strain_id_fkey"
            columns: ["strain_id"]
            isOneToOne: false
            referencedRelation: "strains"
            referencedColumns: ["id"]
          },
        ]
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
          stars: number | null
          strain_id: string | null
          strain_name: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes: number | null
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
          stars?: number | null
          strain_id?: string | null
          strain_name?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
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
          stars?: number | null
          strain_id?: string | null
          strain_name?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
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
        Relationships: [
          {
            foreignKeyName: "email_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "kit_deliveries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          amount: number
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
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
      post_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          downvotes: number | null
          id: string
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          downvotes?: number | null
          id?: string
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
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
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_interactions: {
        Row: {
          created_at: string | null
          id: string
          interaction_type: string | null
          post_id: string | null
          strain_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          post_id?: string | null
          strain_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          interaction_type?: string | null
          post_id?: string | null
          strain_id?: string | null
          user_id?: string
        }
        Relationships: [
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
        Relationships: [
          {
            foreignKeyName: "private_member_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_member_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
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
        }
        Insert: {
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
        }
        Update: {
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
        Relationships: [
          {
            foreignKeyName: "promo_code_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      users: {
        Row: {
          avatar_url: string | null
          consent_date: string | null
          consent_given: boolean | null
          created_at: string | null
          date_of_birth: string
          email: string
          email_verified: boolean | null
          id: string
          is_admin: boolean | null
          last_login: string | null
          mailerlite_subscriber_id: string | null
          name: string
          onboarding_completed: boolean | null
          phone: string | null
          phone_number: string | null
          preferences: Json | null
          status: string | null
          subscription_tier: string | null
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          consent_date?: string | null
          consent_given?: boolean | null
          created_at?: string | null
          date_of_birth: string
          email: string
          email_verified?: boolean | null
          id?: string
          is_admin?: boolean | null
          last_login?: string | null
          mailerlite_subscriber_id?: string | null
          name: string
          onboarding_completed?: boolean | null
          phone?: string | null
          phone_number?: string | null
          preferences?: Json | null
          status?: string | null
          subscription_tier?: string | null
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          consent_date?: string | null
          consent_given?: boolean | null
          created_at?: string | null
          date_of_birth?: string
          email?: string
          email_verified?: boolean | null
          id?: string
          is_admin?: boolean | null
          last_login?: string | null
          mailerlite_subscriber_id?: string | null
          name?: string
          onboarding_completed?: boolean | null
          phone?: string | null
          phone_number?: string | null
          preferences?: Json | null
          status?: string | null
          subscription_tier?: string | null
          tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          status?: string | null
          user_id?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_age_verified: {
        Args: { user_date_of_birth: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
