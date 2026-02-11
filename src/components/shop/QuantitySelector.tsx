import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxQuantity: number;
  disabled?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onQuantityChange,
  maxQuantity,
  disabled = false
}) => {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= maxQuantity) {
      onQuantityChange(value);
    }
  };

  const handleInputBlur = () => {
    // Ensure value is within bounds when input loses focus
    if (quantity < 1) {
      onQuantityChange(1);
    } else if (quantity > maxQuantity) {
      onQuantityChange(maxQuantity);
    }
  };

  return (
    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDecrease}
        disabled={disabled || quantity <= 1}
        className="h-10 w-10 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </Button>
      
      <Input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        disabled={disabled}
        className="h-10 w-16 text-center border-0 focus:ring-0 focus:outline-none"
        min={1}
        max={maxQuantity}
        aria-label="Quantity"
      />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleIncrease}
        disabled={disabled || quantity >= maxQuantity}
        className="h-10 w-10 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
};