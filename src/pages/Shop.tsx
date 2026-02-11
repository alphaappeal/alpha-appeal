import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductGrid, Product } from '@/components/shop/ProductGrid';
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
    <div className="min-h-screen bg-background-dark">
      {/* Page Header */}
      <div className="bg-surface-dark border-b border-white/10 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
              Shop Collection
            </h1>
            <p className="text-gray-400 text-lg">
              Discover premium cannabis accessories and lifestyle products
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Filters Section */}
        <div className="glass-panel rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  search
                </span>
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 bg-surface-dark border-border-dark"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full bg-surface-dark border-border-dark">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-surface-dark border-border-dark">
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="apparel">Apparel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full bg-surface-dark border-border-dark">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-surface-dark border-border-dark">
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="sustainability">Sustainability</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Min Price (R)</label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={handleMinPriceChange}
                className="bg-surface-dark border-border-dark"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Max Price (R)</label>
              <Input
                type="number"
                placeholder="1000"
                value={maxPrice}
                onChange={handleMaxPriceChange}
                className="bg-surface-dark border-border-dark"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm text-gray-400 hover:text-white border border-border-dark rounded-lg hover:border-primary transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Loading products...
              </span>
            ) : (
              <>
                <span className="text-white font-medium">{products.length}</span> products found
                {searchQuery && ` for "${searchQuery}"`}
                {categoryFilter && ` in ${categoryFilter}`}
              </>
            )}
          </div>
          {error && (
            <div className="text-red-400 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}
        </div>

        {/* Product Grid */}
        <ProductGrid
          products={products}
          isLoading={isLoading}
          isEmpty={products.length === 0 && !isLoading}
        />
      </div>
    </div>
  );
};

export default Shop;