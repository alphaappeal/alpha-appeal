import { useState, useEffect } from "react";
import { Plus, MapPin, Trash2, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// Interface for Address
export interface Address {
    id: string;
    label: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    isDefault: boolean;
}

export const AddressBook = () => {
    const { toast } = useToast();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Omit<Address, "id" | "isDefault">>({
        label: "",
        street: "",
        city: "",
        province: "",
        postalCode: "",
    });

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem("user_addresses");
        if (saved) {
            try {
                setAddresses(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse addresses", e);
            }
        }
    }, []);

    // Save to LocalStorage
    const saveToStorage = (newAddresses: Address[]) => {
        setAddresses(newAddresses);
        localStorage.setItem("user_addresses", JSON.stringify(newAddresses));
    };

    const handleSave = () => {
        if (!formData.street || !formData.city || !formData.province || !formData.postalCode) {
            toast({
                title: "Missing fields",
                description: "Please fill in all address details.",
                variant: "destructive",
            });
            return;
        }

        if (editingId) {
            // Update existing
            const updated = addresses.map((addr) =>
                addr.id === editingId ? { ...addr, ...formData } : addr
            );
            saveToStorage(updated);
            toast({ title: "Address updated" });
        } else {
            // Create new
            const newAddress: Address = {
                id: crypto.randomUUID(),
                isDefault: addresses.length === 0, // First one is default
                ...formData,
            };
            saveToStorage([...addresses, newAddress]);
            toast({ title: "Address added" });
        }

        resetForm();
        setIsDialogOpen(false);
    };

    const deleteAddress = (id: string) => {
        const filtered = addresses.filter((a) => a.id !== id);
        saveToStorage(filtered);
        toast({ title: "Address removed" });
    };

    const setDefault = (id: string) => {
        const updated = addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
        }));
        saveToStorage(updated);
        toast({ title: "Default address updated" });
    };

    const handleEdit = (address: Address) => {
        setFormData({
            label: address.label,
            street: address.street,
            city: address.city,
            province: address.province,
            postalCode: address.postalCode,
        });
        setEditingId(address.id);
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            label: "",
            street: "",
            city: "",
            province: "",
            postalCode: "",
        });
        setEditingId(null);
    };

    return (
        <Card className="w-full bg-card/30 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-display flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-secondary" />
                    Address Book
                </CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={resetForm}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Address" : "Add Address"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Label (e.g. Home, Work)</Label>
                                <Input
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    placeholder="Home"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Street Address</Label>
                                <Input
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                    placeholder="123 Main St"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Cape Town"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Postal Code</Label>
                                    <Input
                                        value={formData.postalCode}
                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                        placeholder="8001"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Province</Label>
                                <Input
                                    value={formData.province}
                                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                    placeholder="Western Cape"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave}>Save Address</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
                {addresses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No addresses saved.</p>
                ) : (
                    addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className={`p-4 rounded-xl border ${addr.isDefault
                                    ? "border-secondary/50 bg-secondary/5"
                                    : "border-border/50 bg-card/50"
                                } flex items-center justify-between group transition-all hover:border-secondary/30`}
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-foreground">{addr.label || "Address"}</span>
                                    {addr.isDefault && (
                                        <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">Default</span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {addr.street}, {addr.city}, {addr.province}, {addr.postalCode}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!addr.isDefault && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-secondary"
                                        onClick={() => setDefault(addr.id)}
                                        title="Set as Default"
                                    >
                                        <Check className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleEdit(addr)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteAddress(addr.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
};
