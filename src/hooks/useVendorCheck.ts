import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if the current user has vendor access
 * Checks for active vendor_accounts associated with the user
 */
export const useVendorCheck = () => {
  const [isVendor, setIsVendor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [vendorAccounts, setVendorAccounts] = useState<any[]>([]);

  useEffect(() => {
    const checkVendorAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsVendor(false);
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      try {
        // Check for active vendor accounts
        const { data, error } = await supabase
          .from("vendor_accounts")
          .select(`id, partner_id, role, alpha_partners!inner (id, name)`)
          .eq("user_id", session.user.id)
          .eq("is_active", true);

        if (error) {
          console.error("Error checking vendor access:", error);
          setIsVendor(false);
        } else {
          const validAccounts = data || [];
          setIsVendor(validAccounts.length > 0);
          setVendorAccounts(validAccounts);
        }
      } catch (err) {
        console.error("Vendor check error:", err);
        setIsVendor(false);
      } finally {
        setLoading(false);
      }
    };

    checkVendorAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkVendorAccess();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isVendor, loading, userId, vendorAccounts };
};
