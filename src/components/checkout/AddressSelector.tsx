import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCheckoutActions } from '@/lib/stores/checkoutStore';
import { ShippingAddress } from '@/lib/types/cart';
import { Plus, Edit, Trash2, MapPin, Star, CheckCircle } from 'lucide-react';

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
    return `${address.street_address}, ${address.city}, ${address.province} ${address.postal_code}, ${address.country}`;
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      // TODO: Add API call to delete address from Supabase
      onDeleteAddress(addressId);
      toast({
        title: "Address Deleted",
        description: "The address has been removed from your saved addresses.",
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">
          Select {type === 'shipping' ? 'Shipping' : 'Billing'} Address
        </h4>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddNewAddress}
          className="text-gray-600 hover:text-gray-900"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {savedAddresses.length > 0 ? (
        <div className="space-y-3">
          {savedAddresses.map((address) => (
            <div
              key={address.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedAddress?.id === address.id
                  ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onSelectAddress(address)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    selectedAddress?.id === address.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-gray-900">{address.full_name}</h5>
                      {address.is_default && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </span>
                      )}
                      <span className="text-xs text-gray-500 capitalize">{address.address_type}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{formatAddress(address)}</p>
                    {address.phone && (
                      <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedAddress?.id === address.id && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditAddress(address);
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {!address.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAddress(address.id);
                        }}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 border border-gray-200 rounded-lg text-center">
          <div className="text-gray-500 mb-2">No saved addresses found</div>
          <p className="text-sm text-gray-600">
            Add a new address to save it for future orders
          </p>
        </div>
      )}
    </div>
  );
};