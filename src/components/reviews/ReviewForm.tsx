import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Review } from "./ReviewList";

interface ReviewFormProps {
    productId: string;
    onReviewSubmitted: (review: Review) => void;
}

export const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
    const { user, profile } = useAuth();
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: "Please sign in",
                description: "You need to be logged in to leave a review.",
                variant: "destructive",
            });
            return;
        }

        if (rating === 0) {
            toast({
                title: "Rating required",
                description: "Please select a star rating.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        // Simulate API delay
        setTimeout(() => {
            const newReview: Review = {
                id: crypto.randomUUID(),
                productId,
                userId: user.id,
                userName: profile?.full_name || profile?.username || user.email?.split('@')[0] || "Anonymous",
                rating,
                title,
                content,
                date: new Date().toISOString(),
                helpfulCount: 0,
                verified: true, // Assuming verified for now
            };

            onReviewSubmitted(newReview);

            // Reset form
            setRating(0);
            setTitle("");
            setContent("");
            setIsSubmitting(false);

            toast({
                title: "Review submitted",
                description: "Thank you for your feedback!",
            });
        }, 1000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-card/30 p-6 rounded-2xl border border-border/50">
            <h3 className="text-lg font-semibold font-display">Write a Review</h3>

            <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none transition-transform hover:scale-110"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                        >
                            <Star
                                className={`w-6 h-6 ${star <= (hoverRating || rating)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-muted-foreground/30"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Review</Label>
                <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What did you like or dislike about this product?"
                    required
                    className="min-h-[100px]"
                />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
        </form>
    );
};
