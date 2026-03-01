import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export interface ProfileData {
  user: any;
  profile: any;
  subscription: any;
  preferences: any;
  wallet: { credit_balance: number; token_balance: number } | null;
  referralCode: string | null;
  referralCount: number;
  starredStrains: any[];
  starredArt: any[];
  starredCulture: any[];
  starredCultureItems: { fashion: any[]; wellness: any[]; cars: any[]; artwork: any[] };
  deliveries: any[];
  supportTickets: any[];
  loading: boolean;
}

export const useProfileData = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ProfileData>({
    user: null,
    profile: null,
    subscription: null,
    preferences: null,
    wallet: null,
    referralCode: null,
    referralCount: 0,
    starredStrains: [],
    starredArt: [],
    starredCulture: [],
    starredCultureItems: { fashion: [], wellness: [], cars: [], artwork: [] },
    deliveries: [],
    supportTickets: [],
    loading: true,
  });

  const refreshWallet = useCallback(async (userId: string) => {
    const { data: walletData } = await supabase
      .from("user_wallet")
      .select("credit_balance, token_balance")
      .eq("user_id", userId)
      .maybeSingle();
    setData(prev => ({
      ...prev,
      wallet: walletData ? {
        credit_balance: walletData.credit_balance ?? 0,
        token_balance: walletData.token_balance ?? 0,
      } : { credit_balance: 0, token_balance: 0 },
    }));
  }, []);

  useEffect(() => {
    const load = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError.message);
      }
      if (!session) {
        navigate("/login");
        return;
      }
      const uid = session.user.id;

      // Parallel fetches
      const [
        profilesRes,
        profileRes,
        subRes,
        prefRes,
        walletRes,
        refCodeRes,
        referralsRes,
        strainStarsRes,
        artStarsRes,
        cultureStarsRes,
        deliveriesRes,
        ticketsRes,
        cultureItemStarsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
        supabase.from("users").select("*").eq("id", uid).maybeSingle(),
        supabase.from("subscriptions").select("*").eq("user_id", uid).eq("status", "active").maybeSingle(),
        supabase.from("user_preferences").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("user_wallet").select("credit_balance, token_balance").eq("user_id", uid).maybeSingle(),
        supabase.from("referral_codes").select("code").eq("user_id", uid).eq("active", true).maybeSingle(),
        supabase.from("referrals").select("id").eq("referrer_id", uid),
        supabase.from("post_interactions").select("strain_id").eq("user_id", uid).eq("interaction_type", "star").not("strain_id", "is", null),
        supabase.from("art_interactions").select("post_id").eq("user_id", uid).eq("interaction_type", "star"),
        supabase.from("culture_interactions").select("post_id").eq("user_id", uid).eq("interaction_type", "star"),
        supabase.from("user_deliveries").select("*, orders(order_number, amount, product_name)").eq("user_id", uid).order("created_at", { ascending: false }).limit(10),
        supabase.from("support_tickets").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(10),
        supabase.from("post_interactions").select("culture_item_id").eq("user_id", uid).eq("interaction_type", "star").not("culture_item_id", "is", null),
      ]);

      // Log any RLS or query errors
      const queries = { profileRes, subRes, prefRes, walletRes, refCodeRes, referralsRes, strainStarsRes, artStarsRes, cultureStarsRes, deliveriesRes, ticketsRes };
      Object.entries(queries).forEach(([name, res]) => {
        if (res.error) {
          console.error(`Profile query [${name}] failed:`, res.error.code, res.error.message, res.error.hint);
        }
      });

      // Fetch starred strain details
      let starredStrains: any[] = [];
      if (strainStarsRes.data && strainStarsRes.data.length > 0) {
        const ids = strainStarsRes.data.map(i => i.strain_id).filter(Boolean) as string[];
        if (ids.length > 0) {
          const { data: strains } = await supabase.from("strains").select("id, name, slug, type").in("id", ids);
          starredStrains = strains || [];
        }
      }

      // Fetch starred art details
      let starredArt: any[] = [];
      if (artStarsRes.data && artStarsRes.data.length > 0) {
        const ids = artStarsRes.data.map(i => i.post_id).filter(Boolean) as string[];
        if (ids.length > 0) {
          const { data: arts } = await supabase.from("art_posts").select("id, title, artist_name, image_url").in("id", ids);
          starredArt = arts || [];
        }
      }

      // Fetch starred culture details
      let starredCulture: any[] = [];
      if (cultureStarsRes.data && cultureStarsRes.data.length > 0) {
        const ids = cultureStarsRes.data.map(i => i.post_id).filter(Boolean) as string[];
        if (ids.length > 0) {
          const { data: cultures } = await supabase.from("culture_posts").select("id, title, category, image_url").in("id", ids);
          starredCulture = cultures || [];
        }
      }

      // Fetch starred culture items (fashion, wellness, cars, artwork)
      const starredCultureItems = { fashion: [] as any[], wellness: [] as any[], cars: [] as any[], artwork: [] as any[] };
      if (cultureItemStarsRes?.data && cultureItemStarsRes.data.length > 0) {
        const ids = cultureItemStarsRes.data.map((i: any) => i.culture_item_id).filter(Boolean) as string[];
        if (ids.length > 0) {
          const { data: items } = await supabase.from("culture_items").select("id, name, slug, category, img_url, creator, type").in("id", ids);
          if (items) {
            items.forEach((item: any) => {
              const cat = (item.category || "").toLowerCase();
              if (cat in starredCultureItems) {
                (starredCultureItems as any)[cat].push(item);
              }
            });
          }
        }
      }

      // Merge: users table first, then profiles table overrides (profiles = source of truth)
      const mergedProfile = {
        ...(profileRes.data || {}),   // users table (base)
        ...(profilesRes.data || {}),  // profiles table (overrides)
      };

      setData({
        user: session.user,
        profile: mergedProfile,
        subscription: subRes.data,
        preferences: prefRes.data,
        wallet: walletRes.data ? {
          credit_balance: walletRes.data.credit_balance ?? 0,
          token_balance: walletRes.data.token_balance ?? 0,
        } : { credit_balance: 0, token_balance: 0 },
        referralCode: refCodeRes.data?.code ?? null,
        referralCount: referralsRes.data?.length ?? 0,
        starredStrains,
        starredArt,
        starredCulture,
        starredCultureItems,
        deliveries: deliveriesRes.data || [],
        supportTickets: ticketsRes.data || [],
        loading: false,
      });
    };
    load();
  }, [navigate]);

  return { ...data, refreshWallet };
};
