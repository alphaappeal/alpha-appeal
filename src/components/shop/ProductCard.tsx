import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Leaf, ShoppingCart } from 'lucide-react';
import { formatZAR } from '@/lib/currency';

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  slug: string;
  product_name: string;
  price: number;
  stock_quantity: number;
  sustainability_score?: number | null;
  hemp_based: boolean;
  product_images: ProductImage[];
  compare_at_price?: number | null;
  description?: string | null;
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Get primary image or first image
  const primaryImage = product.product_images.find(img => img.is_primary) ||
    product.product_images[0];

  // Calculate sustainability stars (1-5)
  const getStarRating = (score?: number | null) => {
    if (!score || score < 1) return 1;
    if (score > 5) return 5;
    return Math.round(score);
  };

  const starRating = getStarRating(product.sustainability_score);
  const isOutOfStock = product.stock_quantity === 0;
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${isOutOfStock ? 'opacity-60' : ''
        }`}
    >
      <Link to={`/shop/product/${product.id}`}>
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {primaryImage ? (
            <img
              src={primaryImage.image_url}
              alt={primaryImage.alt_text || product.product_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Leaf className="w-16 h-16 text-green-400 opacity-50" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 space-y-1">
            {product.hemp_based && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                <Leaf className="w-3 h-3 mr-1" />
                Hemp
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
            {hasDiscount && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
                Sale
              </Badge>
            )}
          </div>

          {/* Sustainability Score */}
          <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-medium text-gray-700">{starRating}/5</span>
          </div>
        </div>

        {/* Product Content */}
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {product.product_name}
          </h3>

          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatZAR(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {formatZAR(product.compare_at_price!)}
                </span>
              )}
            </div>

            {!isOutOfStock && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <ShoppingCart className="w-3 h-3" />
                <span>In Stock</span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>

      {/* Footer Actions */}
      <CardFooter className="p-4 pt-0">
        {/* Sustainability Details */}
        <div className="w-full text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>Sustainability Score</span>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < starRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
          </div>
          {product.hemp_based && (
            <div className="flex items-center justify-between">
              <span>Hemp-Based</span>
              <Leaf className="w-3 h-3 text-green-500" />
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};