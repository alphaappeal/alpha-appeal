import React from 'react';
import { ProductCard, Product } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  isEmpty?: boolean;
  onProductClick?: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  isEmpty = false,
  onProductClick
}) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-square bg-gray-100">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4 bg-gray-200" />
              <Skeleton className="h-4 w-1/2 bg-gray-200" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-16 bg-gray-200" />
                <Skeleton className="h-3 w-12 bg-gray-200" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (isEmpty || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-4h-2v4m0 0h-2m-4-4v4m-2-4v.01"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">
          We couldn't find any products matching your criteria. Try adjusting your filters or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
};

// Loading skeleton for individual cards
export const ProductCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-square bg-gray-100">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2 bg-gray-200" />
        <Skeleton className="h-4 w-1/2 mb-3 bg-gray-200" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16 bg-gray-200" />
          <Skeleton className="h-3 w-12 bg-gray-200" />
        </div>
      </div>
      <div className="p-4 pt-0">
        <div className="w-full text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>Sustainability Score</span>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-3 h-3 bg-gray-200 rounded-full" />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>Hemp-Based</span>
            <Skeleton className="w-3 h-3 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
};