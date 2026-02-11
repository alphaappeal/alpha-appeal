import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ShippingAddress } from '@/lib/types/cart';
import { cn } from "@/lib/utils";

interface AddressSelectorProps {
  type: 'shipping' | 'billing';
  selectedAddress: ShippingAddress | null;
  savedAddresses: ShippingAddress[];
  onSelectAddress: (address: ShippingAddress) => void;
  onAddNewAddress: () => void;
  onEditAddress: (address: ShippingAddress) => void;
  onDeleteAddress: (addressId: string) => void;
}

export const AddressSelector: React.FC<AddressSelectorProps> = ({
  type,
  selectedAddress,
  savedAddresses,
  onSelectAddress,
  onAddNewAddress,
  onEditAddress,
  onDeleteAddress
}) => {
  const { toast } = useToast();

  const formatAddress = (address: ShippingAddress) => {
    return `${address.street_address}, ${address.city}, ${address.province} ${address.postal_code}`;
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      onDeleteAddress(addressId);
      toast({
        title: "Registry Deletion",
        description: "The specified coordinates have been purged from your logistics registry.",
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Registry Fault",
        description: "The system encountered a disruption while attempting deletion.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          {type === 'shipping' ? 'Logistics Registry' : 'Billing Framework'}
        </label>
        <button
          onClick={onAddNewAddress}
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-primary hover:text-primary-dark transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add_location_alt</span>
          Register New Coordinates
        </button>
      </div>

      {savedAddresses.length > 0 ? (
        <div className="space-y-4">
          {savedAddresses.map((address) => (
            <div
              key={address.id}
              className={cn(
                "p-6 rounded-2xl cursor-pointer transition-all duration-500 border relative group overflow-hidden",
                selectedAddress?.id === address.id
                  ? "bg-primary/10 border-primary/40 shadow-[0_0_25px_rgba(107,142,107,0.1)]"
                  : "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]"
              )}
              onClick={() => onSelectAddress(address)}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-start gap-5">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border flex-shrink-0",
                    selectedAddress?.id === address.id
                      ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(107,142,107,0.4)]"
                      : "bg-white/5 border-white/10 text-gray-500 group-hover:border-primary/30 group-hover:text-primary/70"
                  )}>
                    <span className="material-symbols-outlined text-xl">location_on</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h5 className="font-bold text-white uppercase tracking-wider text-sm truncate">{address.full_name}</h5>
                      {address.is_default && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] uppercase tracking-widest font-bold">
                          <span className="material-symbols-outlined text-[10px]">headline</span>
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                      {formatAddress(address)}
                    </p>
                    {address.phone && (
                      <div className="flex items-center gap-2 mt-3 text-gray-500">
                        <span className="material-symbols-outlined text-xs">phone_callback</span>
                        <span className="text-[9px] uppercase tracking-widest font-bold">{address.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAddress(address);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 hover:border-white/20 hover:text-white text-gray-500 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    {!address.is_default && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(address.id);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center border border-white/5 hover:border-red-500/20 hover:text-red-400 text-gray-500 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    )}
                  </div>

                  <div className={cn(
                    "w-6 h-6 rounded-full border items-center justify-center flex transition-all duration-500",
                    selectedAddress?.id === address.id ? "bg-primary border-primary text-white scale-110" : "bg-transparent border-white/10"
                  )}>
                    {selectedAddress?.id === address.id && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </div>
                </div>
              </div>

              {/* Decorative accent for selected */}
              {selectedAddress?.id === address.id && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 px-6 border border-dashed border-white/10 rounded-2xl text-center bg-white/5">
          <span className="material-symbols-outlined text-gray-700 text-4xl mb-4 block">not_listed_location</span>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">No registered coordinates discovered</p>
          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-medium mt-2 leading-relaxed">
            Please define your delivery framework to initiate logistics.
          </p>
        </div>
      )}
    </div>
  );
};