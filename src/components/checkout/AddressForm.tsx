import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutActions } from '@/lib/stores/checkoutStore';
import { ShippingAddress } from '@/lib/types/cart';
import { Plus, Trash2, Edit, Save, MapPin, Phone, Mail, AlertCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
    if (!val) return true; // Optional field
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
  const { saveNewAddress, loadSavedAddresses } = useCheckoutActions();
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
      title: "Address Saved",
      description: `${type === 'shipping' ? 'Shipping' : 'Billing'} address has been updated.`,
    });
  };

  const handleUseSavedAddress = (address: ShippingAddress) => {
    // Reset form with saved address data
    reset({
      full_name: address.full_name,
      street_address: address.street_address,
      suburb: address.suburb || '',
      city: address.city,
      province: address.province,
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone || '',
      is_default: address.is_default
    });
    
    onChange(address);
    toast({
      title: "Address Selected",
      description: `${type === 'shipping' ? 'Shipping' : 'Billing'} address updated.`,
    });
  };

  const handleSaveNewAddress = async () => {
    handleSubmit(async (data) => {
      setIsSaving(true);
      try {
        const address: ShippingAddress = {
          id: '',
          user_id: '', // Would be current user ID
          address_type: type,
          full_name: data.full_name,
          street_address: data.street_address,
          suburb: data.suburb,
          city: data.city,
          province: data.province,
          postal_code: data.postal_code,
          country: data.country,
          phone: data.phone,
          is_default: data.is_default,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        onChange(address);
        toast({
          title: "Address Saved",
          description: "New address saved successfully.",
        });
      } catch (error) {
        console.error('Error saving new address:', error);
        toast({
          title: "Error",
          description: "Failed to save new address. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const formatAddress = (address: ShippingAddress) => {
    return `${address.street_address}, ${address.suburb ? address.suburb + ', ' : ''}${address.city}, ${address.province} ${address.postal_code}, ${address.country}`;
  };

  return (
    <div className="space-y-4">
      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Saved Addresses</label>
          <div className="space-y-2">
            {savedAddresses.map((address) => (
              <div
                key={address.id}
                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  value?.id === address.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => handleUseSavedAddress(address)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{address.full_name}</div>
                    <div className="text-sm text-gray-600">{formatAddress(address)}</div>
                    {address.is_default && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500 capitalize">{address.address_type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Address Display */}
      {value && !isEditing ? (
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">
              {type === 'shipping' ? 'Shipping' : 'Billing'} Address
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>{value.full_name}</div>
            <div>{value.street_address}</div>
            {value.suburb && <div>{value.suburb}</div>}
            <div>{value.city}, {value.province} {value.postal_code}</div>
            <div>{value.country}</div>
            {value.phone && <div>Phone: {value.phone}</div>}
          </div>
        </div>
      ) : (
        /* Address Form with Validation */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              {type === 'shipping' ? 'Shipping' : 'Billing'} Address
            </h4>
            {isEditing && (
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!isValid || isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1">
                    <Input
                      {...field}
                      placeholder="Enter full name"
                      className={errors.full_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {errors.full_name && (
                      <p className="text-red-600 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <Controller
                name="street_address"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1">
                    <Input
                      {...field}
                      placeholder="Enter street address"
                      className={errors.street_address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {errors.street_address && (
                      <p className="text-red-600 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.street_address.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suburb/Area
              </label>
              <Controller
                name="suburb"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1">
                    <Input
                      {...field}
                      placeholder="Enter suburb/area"
                      className={errors.suburb ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {errors.suburb && (
                      <p className="text-red-600 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.suburb.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1">
                    <Input
                      {...field}
                      placeholder="Enter city"
                      className={errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-red-600 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code *
              </label>
              <Controller
                name="postal_code"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1">
                    <Input
                      {...field}
                      placeholder="Enter postal code"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={errors.postal_code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {errors.postal_code && (
                      <p className="text-red-600 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.postal_code.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province *
              </label>
              <Controller
                name="province"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1">
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue('province', value, { shouldValidate: true });
                      }}
                    >
                      <SelectTrigger className={errors.province ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.province && (
                      <p className="text-red-600 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.province.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                )}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1">
                    <Input
                      {...field}
                      placeholder="Enter phone number (0XX XXX XXXX)"
                      inputMode="tel"
                      pattern="0[0-9]{9}"
                      className={errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </form>
      )}

      {/* Save as New Address */}
      {isEditing && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Controller
              name="is_default"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  id="saveAsNew"
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              )}
            />
            <label htmlFor="saveAsNew" className="text-sm text-gray-600">
              Save as default address
            </label>
          </div>
          
          <Button
            variant="outline"
            onClick={handleSaveNewAddress}
            disabled={isSaving}
            className="text-gray-600 hover:text-gray-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            Save as New Address
          </Button>
        </div>
      )}
    </div>
  );
};
