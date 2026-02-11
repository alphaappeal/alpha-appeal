import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, Minus } from 'lucide-react';

interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  sku: string;
  price_adjustment: number;
  stock_quantity: number;
  created_at: string;
}

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantSelect: (variant: ProductVariant) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onVariantSelect
}) => {
  // Group variants by type (Size, Color, Format, etc.)
  const groupedVariants = variants.reduce((groups, variant) => {
    // Extract variant type from name (e.g., "Size: M" -> "Size")
    const [type, ...nameParts] = variant.variant_name.split(':');
    const variantType = type.trim();
    const variantName = nameParts.join(':').trim();
    
    if (!groups[variantType]) {
      groups[variantType] = [];
    }
    
    groups[variantType].push({
      ...variant,
      display_name: variantName,
      type: variantType
    });
    
    return groups;
  }, {} as Record<string, (ProductVariant & { display_name: string; type: string })[]>);

  const formatPriceAdjustment = (adjustment: number) => {
    if (adjustment === 0) return '';
    return adjustment > 0 
      ? `+ R ${adjustment.toFixed(2)}`
      : `- R ${Math.abs(adjustment).toFixed(2)}`;
  };

  const isVariantAvailable = (variant: ProductVariant & { display_name: string; type: string }) => {
    return variant.stock_quantity > 0;
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedVariants).map(([variantType, typeVariants]) => (
        <div key={variantType}>
          <h4 className="text-sm font-semibold text-gray-900 mb-2 capitalize">{variantType}</h4>
          <div className="flex flex-wrap gap-2">
            {typeVariants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              const isAvailable = isVariantAvailable(variant);
              
              return (
                <Button
                  key={variant.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onVariantSelect(variant)}
                  disabled={!isAvailable}
                  className={`
                    relative transition-all duration-200
                    ${isSelected 
                      ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
                      : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-900'
                    }
                    ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  aria-label={`${variantType}: ${variant.display_name}`}
                >
                  {/* Availability indicator */}
                  {!isAvailable && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <Minus className="w-2 h-2 text-white" />
                    </div>
                  )}
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-green-600" />
                    </div>
                  )}
                  
                  <span className="mr-2">{variant.display_name}</span>
                  
                  {/* Price adjustment */}
                  {variant.price_adjustment !== 0 && (
                    <span className={`text-xs ${
                      variant.price_adjustment > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPriceAdjustment(variant.price_adjustment)}
                    </span>
                  )}
                  
                  {/* Stock indicator */}
                  {variant.stock_quantity <= 3 && variant.stock_quantity > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Only {variant.stock_quantity} left
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Variant Information */}
      {selectedVariant && (
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Selected: {selectedVariant.variant_name}</span>
            <span>SKU: {selectedVariant.sku}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
            <span>Stock: {selectedVariant.stock_quantity} available</span>
            {selectedVariant.price_adjustment !== 0 && (
              <span className={selectedVariant.price_adjustment > 0 ? 'text-green-600' : 'text-red-600'}>
                {selectedVariant.price_adjustment > 0 ? 'Additional' : 'Discount'}: 
                {formatPriceAdjustment(selectedVariant.price_adjustment)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};