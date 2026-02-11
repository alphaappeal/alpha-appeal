import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutActions } from '@/lib/stores/checkoutStore';
import { ShippingAddress } from '@/lib/types/cart';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from "@/lib/utils";

const provinces = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
  'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
];

const addressSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  street_address: z.string().min(10, "Please provide complete street address"),
  suburb: z.string().min(2, "Suburb is required"),
  city: z.string().min(2, "City is required"),
  province: z.enum(provinces as [string, ...string[]], {
    errorMap: () => ({ message: "Please select a province" })
  }),
  postal_code: z.string().regex(/^\d{4}$/, "Postal code must be exactly 4 digits"),
  country: z.string().default("South Africa"),
  phone: z.string().optional().refine((val) => {
    if (!val) return true;
    return /^0\d{9}$/.test(val);
  }, {
    message: "Invalid phone number (must be 0XX XXX XXXX)"
  }),
  is_default: z.boolean().default(false)
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  type: 'shipping' | 'billing';
  value: ShippingAddress | null;
  onChange: (address: ShippingAddress) => void;
  savedAddresses: ShippingAddress[];
}

export const AddressForm: React.FC<AddressFormProps> = ({
  type,
  value,
  onChange,
  savedAddresses
}) => {
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(!value);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: value?.full_name || '',
      street_address: value?.street_address || '',
      suburb: value?.suburb || '',
      city: value?.city || '',
      province: value?.province || '',
      postal_code: value?.postal_code || '',
      country: value?.country || 'South Africa',
      phone: value?.phone || '',
      is_default: value?.is_default || false
    },
    mode: 'onChange'
  });

  const onSubmit = (data: AddressFormData) => {
    const address: ShippingAddress = {
      id: value?.id || '',
      user_id: value?.user_id || '',
      address_type: type,
      full_name: data.full_name,
      street_address: data.street_address,
      suburb: data.suburb || undefined,
      city: data.city,
      province: data.province,
      postal_code: data.postal_code,
      country: data.country,
      phone: data.phone || null,
      is_default: data.is_default,
      created_at: value?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onChange(address);
    setIsEditing(false);

    toast({
      title: "Registry Authorized",
      description: `Your ${type} logistics coordinates have been updated.`,
    });
  };

  const labelStyle = "text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 block";
  const inputStyle = "bg-white/5 border-white/5 rounded-xl text-white font-bold h-12 focus-visible:ring-1 focus-visible:ring-primary/30 transition-all placeholder:text-gray-700";

  return (
    <div className="space-y-8">
      {/* Current Selection / Form Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-white text-xs font-bold uppercase tracking-wider">
          {type === 'shipping' ? 'Logistics Specification' : 'Billing Authority'}
        </h4>
        {value && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-primary hover:text-primary-dark transition-colors"
          >
            <span className="material-symbols-outlined text-sm">edit_location</span>
            Modify Coordinates
          </button>
        )}
      </div>

      {value && !isEditing ? (
        <div className="p-6 bg-white/5 border border-white/5 rounded-2xl animate-in fade-in duration-500">
          <div className="space-y-4">
            <div>
              <p className={labelStyle}>Authorized Entity</p>
              <p className="text-white text-sm font-bold uppercase tracking-wider">{value.full_name}</p>
            </div>
            <div>
              <p className={labelStyle}>Primary Coordinates</p>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                {value.street_address}, {value.suburb && value.suburb + ', '}{value.city}<br />
                {value.province}, {value.postal_code}, {value.country}
              </p>
            </div>
            {value.phone && (
              <div>
                <p className={labelStyle}>Secure Contact</p>
                <p className="text-primary text-xs font-bold uppercase tracking-widest">{value.phone}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-8 glass-panel border border-white/5 rounded-2xl animate-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className={labelStyle}>Full Legal Name *</label>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Input {...field} placeholder="Authentication Name" className={cn(inputStyle, errors.full_name && "border-red-500/50")} />
                    {errors.full_name && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest">{errors.full_name.message}</p>}
                  </div>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelStyle}>Street Address *</label>
              <Controller
                name="street_address"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Input {...field} placeholder="Secure Location Identifier" className={cn(inputStyle, errors.street_address && "border-red-500/50")} />
                    {errors.street_address && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest">{errors.street_address.message}</p>}
                  </div>
                )}
              />
            </div>

            <div>
              <label className={labelStyle}>Suburb / District</label>
              <Controller
                name="suburb"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Area Specification" className={inputStyle} />
                )}
              />
            </div>

            <div>
              <label className={labelStyle}>City / Municipality *</label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Input {...field} placeholder="Urban Center" className={cn(inputStyle, errors.city && "border-red-500/50")} />
                    {errors.city && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest">{errors.city.message}</p>}
                  </div>
                )}
              />
            </div>

            <div>
              <label className={labelStyle}>Postal Identifier *</label>
              <Controller
                name="postal_code"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Input {...field} placeholder="Registry Code" className={cn(inputStyle, errors.postal_code && "border-red-500/50")} />
                    {errors.postal_code && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest">{errors.postal_code.message}</p>}
                  </div>
                )}
              />
            </div>

            <div>
              <label className={labelStyle}>Province / State *</label>
              <Controller
                name="province"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={cn(inputStyle, "bg-white/5 border-white/5", errors.province && "border-red-500/50")}>
                        <SelectValue placeholder="Locality" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#141514] border-white/10 text-white">
                        {provinces.map((p) => <SelectItem key={p} value={p} className="hover:bg-primary/20 transition-colors uppercase text-[10px] font-bold tracking-widest">{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelStyle}>Phone Identification</label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Input {...field} placeholder="Secure Contact Path" className={cn(inputStyle, errors.phone && "border-red-500/50")} />
                    {errors.phone && <p className="text-red-400 text-[10px] uppercase font-bold tracking-widest">{errors.phone.message}</p>}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-white/5">
            <div className="flex items-center gap-3">
              <Controller
                name="is_default"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="saveAsDefault"
                    checked={field.value || false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/30"
                  />
                )}
              />
              <label htmlFor="saveAsDefault" className="text-[10px] text-gray-500 uppercase tracking-widest font-bold cursor-pointer hover:text-gray-400 transition-colors">
                Primary Registry Entry
              </label>
            </div>

            <div className="flex gap-4">
              {value && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="h-12 border-white/5 bg-white/5 text-gray-500 hover:text-white rounded-xl transition-all font-bold uppercase tracking-widest text-[10px] px-8"
                >
                  Discard
                </Button>
              )}
              <Button
                type="submit"
                disabled={!isValid || isSaving}
                className="h-12 bg-primary hover:bg-primary-dark text-white rounded-xl transition-all font-bold uppercase tracking-widest text-[10px] px-10 shadow-[0_0_20px_rgba(107,142,107,0.3)]"
              >
                {isSaving ? (
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                ) : (
                  'Authorize Coordinates'
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
