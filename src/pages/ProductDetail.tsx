import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Leaf, ShoppingCart, Heart, Share2, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatZAR } from '@/lib/currency';
import { ImageGallery } from '@/components/shop/ImageGallery';
import { QuantitySelector } from '@/components/shop/QuantitySelector';
import { AddToCartButton } from '@/components/shop/AddToCartButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ReviewList, Review } from '@/components/reviews/ReviewList';
import { ReviewForm } from '@/components/reviews/ReviewForm';

interface Product {
  id: string;
  name: string;
  price: number;
  in_stock: boolean;
  image_url: string | null;
  description: string | null;
  category: string | null;
  featured: boolean | null;
}

// Temporary interface until we have real related products logic
interface RelatedProduct extends Product { }

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;
    fetchProductAndReviews();
  }, [id]);

  const fetchProductAndReviews = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productError) throw productError;
      setProduct(productData);

      // 2. Load Reviews from LocalStorage
      const savedReviews = localStorage.getItem(`product_reviews_${id}`);
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      } else {
        setReviews([]);
      }

    } catch (err) {
      console.error('Error loading product:', err);
      toast({
        title: "Error",
        description: "Failed to load product details.",
        variant: "destructive",
      });
      // Navigate back to shop if product not found? 
      // navigate('/shop'); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addItem(product.id, quantity);
      toast({
        title: "Added to Cart",
        description: `${product.name} added to your cart.`,
      });
    } catch (error) {
      // Error handled in context usually
    }
  };

  const handleReviewSubmitted = (newReview: Review) => {
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`product_reviews_${id}`, JSON.stringify(updatedReviews));
  };

  // Calculate average rating for display
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0"; // Default to 5 if no reviews to look good

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
      </div>
    );
  }

  const images = product.image_url ? [{
    id: '1',
    product_id: product.id,
    image_url: product.image_url,
    alt_text: product.name,
    display_order: 1,
    is_primary: true,
    created_at: new Date().toISOString()
  }] : [];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <span className="hover:text-foreground cursor-pointer" onClick={() => navigate('/')}>Home</span>
        <span className="mx-2">›</span>
        <span className="hover:text-foreground cursor-pointer" onClick={() => navigate('/shop')}>Shop</span>
        <span className="mx-2">›</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <ImageGallery images={images} productName={product.name} />
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-4xl font-display font-bold text-foreground mb-2">{product.name}</h1>
              <Badge variant={product.in_stock ? 'outline' : 'destructive'} className={product.in_stock ? 'bg-secondary/10 text-secondary border-secondary/20' : ''}>
                {product.in_stock ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-secondary">{formatZAR(product.price)}</span>
              <div className="flex items-center gap-1 text-sm text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium">{averageRating}</span>
                <span className="text-muted-foreground ml-1">({reviews.length} reviews)</span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description || "Experience premium quality with our carefully curated selection."}
            </p>
          </div>

          <div className="space-y-6 pt-6 border-t border-border/50">
            <div className="flex items-center gap-4">
              <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
                maxQuantity={product.in_stock ? 10 : 0} // Hardcoded max for now
                disabled={!product.in_stock}
              />
              <div className="flex-1">
                <Button
                  size="lg"
                  className="w-full text-lg h-12 gap-2"
                  onClick={handleAddToCart}
                  disabled={!product.in_stock}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </Button>
              </div>
              <Button size="icon" variant="outline" className="h-12 w-12">
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-500" />
              <span>Sustainably Sourced</span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span>Share Product</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="w-full justify-start border-b border-border/50 bg-transparent rounded-none h-auto p-0 gap-8">
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-lg"
            >
              Reviews ({reviews.length})
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-lg"
            >
              Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1">
                {user ? (
                  <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
                ) : (
                  <div className="bg-secondary/10 p-6 rounded-2xl text-center">
                    <h3 className="font-semibold mb-2">Have you tried this product?</h3>
                    <p className="text-sm text-muted-foreground mb-4">Sign in to share your experience with the community.</p>
                    <Button variant="outline" onClick={() => navigate('/login')}>Sign In to Review</Button>
                  </div>
                )}
              </div>
              <div className="lg:col-span-2">
                <ReviewList productId={product.id} reviews={reviews} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Product Specifications</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                  <div className="grid grid-cols-2 gap-4 border-b border-border/50 pb-2">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-medium text-right sm:text-left">{product.category || 'General'}</dd>
                  </div>
                  {/* Add more specs as needed */}
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetail;