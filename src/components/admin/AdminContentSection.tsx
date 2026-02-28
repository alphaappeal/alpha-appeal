import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag,
  BookOpen,
  MapPin,
  Palette,
  Store,
  Calendar,
  Truck,
} from "lucide-react";
import ProductsTab from "./ProductsTab";
import CultureTab from "./CultureTab";
import PartnersTab from "./PartnersTab";
import DeliveriesTab from "./DeliveriesTab";
import StoreApprovalsTab from "./StoreApprovalsTab";
import EventPinsTab from "./EventPinsTab";

interface Props {
  products: any[];
  diaryEntries: any[];
  locations: any[];
  loading: boolean;
  onRefreshProducts: () => void;
  resolveUser: (id: string | null) => { name: string; email: string };
  profileMap: Map<string, { name: string; email: string }>;
}

const fmt = (d: string | null) => {
  if (!d) return "N/A";
  return new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
};

const AdminContentSection = ({ products, diaryEntries, locations, loading, onRefreshProducts, resolveUser, profileMap }: Props) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Content & Products</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage products, culture, partners, and deliveries</p>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="bg-admin-surface border border-admin-border p-1 h-auto flex-wrap gap-1">
          <TabsTrigger value="products" className="gap-1.5 text-xs data-[state=active]:bg-admin-emerald/10 data-[state=active]:text-admin-emerald"><ShoppingBag className="w-3.5 h-3.5" /> Products</TabsTrigger>
          <TabsTrigger value="culture" className="gap-1.5 text-xs data-[state=active]:bg-admin-emerald/10 data-[state=active]:text-admin-emerald"><Palette className="w-3.5 h-3.5" /> Culture</TabsTrigger>
          <TabsTrigger value="partners" className="gap-1.5 text-xs data-[state=active]:bg-admin-emerald/10 data-[state=active]:text-admin-emerald"><Store className="w-3.5 h-3.5" /> Partners</TabsTrigger>
          <TabsTrigger value="diary" className="gap-1.5 text-xs data-[state=active]:bg-admin-emerald/10 data-[state=active]:text-admin-emerald"><BookOpen className="w-3.5 h-3.5" /> Diary</TabsTrigger>
          <TabsTrigger value="locations" className="gap-1.5 text-xs data-[state=active]:bg-admin-emerald/10 data-[state=active]:text-admin-emerald"><MapPin className="w-3.5 h-3.5" /> Locations</TabsTrigger>
          <TabsTrigger value="deliveries" className="gap-1.5 text-xs data-[state=active]:bg-admin-emerald/10 data-[state=active]:text-admin-emerald"><Truck className="w-3.5 h-3.5" /> Deliveries</TabsTrigger>
          <TabsTrigger value="store-queue" className="gap-1.5 text-xs data-[state=active]:bg-admin-emerald/10 data-[state=active]:text-admin-emerald"><Store className="w-3.5 h-3.5" /> Store Queue</TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5 text-xs data-[state=active]:bg-admin-emerald/10 data-[state=active]:text-admin-emerald"><Calendar className="w-3.5 h-3.5" /> Events</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsTab products={products} onRefresh={onRefreshProducts} />
        </TabsContent>

        <TabsContent value="culture">
          <CultureTab />
        </TabsContent>

        <TabsContent value="partners">
          <PartnersTab />
        </TabsContent>

        <TabsContent value="diary">
          {loading ? (
            <div className="rounded-xl border border-admin-border bg-admin-surface p-4 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : diaryEntries.length === 0 ? (
            <div className="flex flex-col items-center py-16 rounded-xl border border-admin-border bg-admin-surface">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No diary entries</p>
            </div>
          ) : (
            <div className="rounded-xl border border-admin-border overflow-hidden bg-admin-surface">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-admin-border">
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Author</th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border/50">
                    {diaryEntries.map(entry => {
                      const author = resolveUser(entry.author_id);
                      return (
                        <tr key={entry.id} className="hover:bg-admin-surface-hover transition-colors">
                          <td className="p-3 text-sm font-medium text-foreground">{entry.title}</td>
                          <td className="p-3 text-sm text-muted-foreground">{author.name}</td>
                          <td className="p-3 hidden md:table-cell"><Badge variant="outline" className="text-[10px]">{entry.category || "General"}</Badge></td>
                          <td className="p-3">
                            <Badge variant="outline" className={`text-[10px] ${entry.published ? "bg-admin-emerald/10 text-admin-emerald border-admin-emerald/20" : "bg-muted/10 text-muted-foreground"}`}>
                              {entry.published ? "Published" : "Draft"}
                            </Badge>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground hidden lg:table-cell">{fmt(entry.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="locations">
          {loading ? (
            <div className="rounded-xl border border-admin-border bg-admin-surface p-4 space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : locations.length === 0 ? (
            <div className="flex flex-col items-center py-16 rounded-xl border border-admin-border bg-admin-surface">
              <MapPin className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No locations</p>
            </div>
          ) : (
            <div className="rounded-xl border border-admin-border overflow-hidden bg-admin-surface">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-admin-border">
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">City</th>
                      <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-admin-border/50">
                    {locations.map(loc => (
                      <tr key={loc.id} className="hover:bg-admin-surface-hover transition-colors">
                        <td className="p-3 text-sm font-medium text-foreground">{loc.name}</td>
                        <td className="p-3"><Badge variant="outline" className="text-[10px] capitalize">{loc.type}</Badge></td>
                        <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">{loc.city || "N/A"}</td>
                        <td className="p-3">
                          <Badge variant="outline" className={`text-[10px] ${loc.active ? "bg-admin-emerald/10 text-admin-emerald border-admin-emerald/20" : "bg-muted/10 text-muted-foreground"}`}>
                            {loc.active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="deliveries">
          <DeliveriesTab profileMap={profileMap} />
        </TabsContent>

        <TabsContent value="store-queue">
          <StoreApprovalsTab />
        </TabsContent>

        <TabsContent value="events">
          <EventPinsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContentSection;
