
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";

// Define a type for the product
interface Product {
    id: string;
    name: string; // Adjusted to match likely schema or mapped later
    description: string;
    price: number;
    image_url?: string;
}

const ProductList = () => {
    const { addItem } = useCart();

    const { data: products, isLoading, error } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            // Fetch products from Supabase
            // Note: Adjust table name and fields to match actual schema
            // Defaulting to 'products' table and standard fields
            const { data, error } = await supabase
                .from("products")
                .select("*");

            if (error) throw error;
            return data as any[]; // Using any for now until types are generated
        },
    });

    if (isLoading) {
        return (
            <div className="container py-8">
                <h1 className="text-3xl font-bold mb-6">Shop</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex flex-col space-y-3">
                            <Skeleton className="h-[200px] w-full rounded-xl" />
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-8 text-center text-red-500">
                Failed to load products. Please try again later.
            </div>
        );
    }

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-6">Shop</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products?.map((product) => (
                    <Card key={product.id} className="flex flex-col">
                        <CardHeader>
                            <div className="aspect-square relative mb-2 bg-muted rounded-md overflow-hidden">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                                )}
                            </div>
                            <CardTitle className="text-lg">{product.name || product.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                                {product.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="font-bold text-lg">
                                R {product.price?.toFixed(2)}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <div className="flex w-full gap-2">
                                <Button className="flex-1" onClick={() => addItem({
                                    id: product.id,
                                    name: product.name || product.title,
                                    price: product.price,
                                    quantity: 1,
                                    image: product.image_url
                                })}>
                                    Add to Cart
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link to={`/shop/${product.id}`}>View</Link>
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
                {products?.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No products found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
