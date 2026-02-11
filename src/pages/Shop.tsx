import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid, Product } from '@/components/shop/ProductGrid';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabaseClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const { toast } = useToast();

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = {
        category: categoryFilter || undefined,
        search: searchQuery || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        inStock: true
      };

      const data = await supabaseClient.getProducts(filters);
      
      // Apply sorting
      const sortedProducts = sortProducts(data || [], sortBy);
      setProducts(sortedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
      toast({
        title: "Error",
        description: "Unable to load products. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sort products based on selected option
  const sortProducts = (products: Product[], sortOption: string): Product[] => {
    const sorted = [...products];
    
    switch (sortOption) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.product_name.localeCompare(b.product_name));
      case 'sustainability':
        return sorted.sort((a, b) => (b.sustainability_score || 0) - (a.sustainability_score || 0));
      default:
        return sorted;
    }
  };

  // Update URL parameters when filters change
  useEffect(() => {
    const params: Record<string, string> = {};
    
    if (searchQuery) params.search = searchQuery;
    if (categoryFilter) params.category = categoryFilter;
    if (sortBy) params.sort = sortBy;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    setSearchParams(params);
  }, [searchQuery, categoryFilter, sortBy, minPrice, maxPrice, setSearchParams]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle category filter
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  // Handle price range
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setSortBy('name');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop Our Collection</h1>
        <p className="text-gray-600">Discover sustainable, hemp-based products and more</p>
      </div>

      {/* Filters Section */}
      <Card className="mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full"
            />
          </div>

          {/* Category Filter */}
          <div>
            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="wellness">Wellness</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="nfts">NFTs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="sustainability">Sustainability Score</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:border-gray-400 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Price Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
            <Input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={handleMinPriceChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
            <Input
              type="number"
              placeholder="1000"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              className="w-full"
            />
          </div>
        </div>
      </Card>

      {/* Results Info */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {isLoading ? 'Loading products...' : `${products.length} products found`}
          {searchQuery && ` for "${searchQuery}"`}
          {categoryFilter && ` in ${categoryFilter}`}
        </div>
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
      </div>

      {/* Product Grid */}
      <ProductGrid
        products={products}
        isLoading={isLoading}
        isEmpty={products.length === 0 && !isLoading}
      />
    </div>
  );
};

export default Shop;