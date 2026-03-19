import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Store, CheckCircle, XCircle, AlertCircle, Database, UserCog } from "lucide-react";

const VendorDiagnostic = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [allVendors, setAllVendors] = useState<any[]>([]);
  const [myVendors, setMyVendors] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkVendorStatus();
  }, []);

  const checkVendorStatus = async () => {
    try {
      setError(null);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setError("Not logged in - please sign in first");
        setLoading(false);
        return;
      }

      setUserId(session.user.id);
      setUserEmail(session.user.email || null);

      console.log('🔍 Checking vendor status for user:', session.user.id, session.user.email);

      // Check vendor_accounts table for THIS user
      const { data: myAccounts, error: myError } = await supabase
        .from("vendor_accounts")
        .select(`id, partner_id, role, is_active, created_at, alpha_partners!inner (id, name)`)
        .eq("user_id", session.user.id);

      if (myError) {
        console.error('❌ Error fetching my vendor accounts:', myError);
        setError(`Error checking vendor accounts: ${myError.message}`);
      } else {
        setMyVendors(myAccounts || []);
        console.log('✅ Found vendor accounts:', myAccounts?.length || 0);
      }

      // Try to fetch ALL vendors (will fail if not admin, but useful for debugging)
      const { data: allAccounts, error: allError } = await supabase
        .from("vendor_accounts")
        .select(`id, user_id, partner_id, role, is_active, created_at, alpha_partners!inner (id, name)`)
        .order('created_at', { ascending: false });

      if (!allError && allAccounts) {
        setAllVendors(allAccounts);
        console.log('✅ Total vendor accounts in system:', allAccounts.length);
      }

    } catch (err: any) {
      console.error('❌ Diagnostic error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5 text-secondary" />
          Vendor Access Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Current User
          </h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="text-foreground font-mono text-xs truncate max-w-[300px]">{userId || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="text-foreground text-xs truncate max-w-[300px]">{userEmail || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auth Status:</span>
              <Badge variant={userId ? "default" : "destructive"}>
                {userId ? "Logged In" : "Not Logged In"}
              </Badge>
            </div>
          </div>
        </div>

        {/* My Vendor Accounts */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Your Vendor Accounts ({myVendors.length})
          </h3>
          {myVendors.length === 0 ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                No active vendor accounts found for your user. You need admin approval or manual account creation.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-sm text-green-500">
                  Found {myVendors.length} active vendor account(s) - FAB and header link should be visible!
                </AlertDescription>
              </Alert>
              {myVendors.map((account) => (
                <div key={account.id} className="p-3 rounded bg-background border border-border">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account ID:</span>
                      <span className="text-foreground font-mono text-xs truncate">{account.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Store:</span>
                      <span className="text-foreground">{account.alpha_partners?.name || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <Badge variant="secondary" className="capitalize">{account.role}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active:</span>
                      <Badge variant={account.is_active ? "default" : "secondary"}>
                        {account.is_active ? "Yes ✓" : "No ✗"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="text-foreground text-xs">
                        {new Date(account.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All System Vendors (Admin View) */}
        {allVendors.length > 0 && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Database className="w-5 h-5" />
              All Vendor Accounts in System ({allVendors.length})
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {allVendors.map((v) => (
                <div key={v.id} className="p-2 rounded bg-background border border-border text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-mono truncate flex-1">{v.user_id.slice(0, 8)}...</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="truncate max-w-[150px]">{v.alpha_partners?.name}</span>
                    <Badge variant={v.is_active ? "default" : "secondary"} className="text-[10px]">
                      {v.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What This Means */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            Diagnosis & Next Steps
          </h3>
          {myVendors.length > 0 ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="text-green-600 font-medium">✅ You HAVE vendor access!</p>
              <p>If you don't see the FAB or header link:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Try refreshing the page (Ctrl+Shift+R)</li>
                <li>Clear browser cache</li>
                <li>Check browser console for errors</li>
                <li>Verify useVendorCheck hook is being called</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="text-destructive font-medium">❌ You DON'T have vendor access yet</p>
              <p>To get vendor access, you need to:</p>
              <ol className="list-decimal list-inside ml-2 space-y-1">
                <li>Have an admin manually create a vendor account for you, OR</li>
                <li>Submit a vendor application and get approved by admin</li>
              </ol>
              <p className="mt-2 text-xs">Note: Being logged in doesn't automatically give you vendor access - you need an explicit entry in the vendor_accounts table.</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 flex-wrap">
          <Button onClick={checkVendorStatus} variant="outline">
            Refresh Check
          </Button>
          {myVendors.length === 0 ? (
            <>
              <Button onClick={() => window.location.href = "/vendor/signup"} variant="sage">
                Apply for Vendor Access
              </Button>
              <Button onClick={() => window.location.href = "/"} variant="outline">
                Go Home
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => window.location.href = "/vendor"} variant="sage">
                Go to Vendor Portal →
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline">
                Refresh Page
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorDiagnostic;
