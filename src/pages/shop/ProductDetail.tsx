
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ProductDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { addItem } = useCart();

    const { data: product, isLoading, error } = useQuery({
        queryKey: ["product", id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("products")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container py-8 text-center text-red-500">
                Product not found or failed to load.
            </div>
        );
    }

    return (
        <div className="container py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
                    ) : (
                        <span className="text-muted-foreground">No Image Available</span>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-bold">{product.name || product.title}</h1>
                        <p className="text-2xl font-bold mt-2 text-primary">
                            R {product.price?.toFixed(2)}
                        </p>
                    </div>

                    <div className="prose dark:prose-invert">
                        <p>{product.description}</p>
                    </div>

                    <div className="flex gap-4 mt-auto">
                        <Button
                            size="lg"
                            className="w-full md:w-auto"
                            onClick={() => addItem({
                                id: product.id,
                                name: product.name || product.title,
                                price: product.price,
                                quantity: 1,
                                image: product.image_url
                            })}
                        >
                            Add to Cart
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
