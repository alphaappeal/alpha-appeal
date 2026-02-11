import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sort images by display order, with primary image first
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.display_order - b.display_order;
  });

  const primaryImage = sortedImages.find(img => img.is_primary) || sortedImages[0];
  const currentImage = sortedImages[currentIndex] || primaryImage;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : sortedImages.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < sortedImages.length - 1 ? prev + 1 : 0));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleZoom = () => {
    // TODO: Implement lightbox/modal for zoom
    console.log('Zoom functionality to be implemented');
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <Card className="overflow-hidden">
        <div className="relative aspect-square bg-gray-100">
          {currentImage ? (
            <img
              src={currentImage.image_url}
              alt={currentImage.alt_text || productName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <ZoomIn className="w-16 h-16 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No images available</p>
              </div>
            </div>
          )}
          
          {/* Navigation Arrows */}
          {sortedImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={handlePrevious}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={handleNext}
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Zoom Button */}
          {currentImage && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
              onClick={handleZoom}
              aria-label="Zoom image"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          )}

          {/* Image Counter */}
          {sortedImages.length > 1 && (
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {currentIndex + 1} / {sortedImages.length}
            </div>
          )}
        </div>
      </Card>

      {/* Thumbnail Strip */}
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              className={`relative aspect-square border-2 rounded-lg overflow-hidden transition-all ${
                index === currentIndex 
                  ? 'border-green-500 ring-2 ring-green-500/20' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleThumbnailClick(index)}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image.image_url}
                alt={image.alt_text || `${productName} - image ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-green-500/20 pointer-events-none"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};