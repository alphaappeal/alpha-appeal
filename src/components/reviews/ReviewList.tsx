import { Star, ThumbsUp, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    title: string;
    content: string;
    date: string;
    helpfulCount: number;
    verified: boolean;
}

interface ReviewListProps {
    productId: string;
    reviews: Review[];
}

export const ReviewList = ({ productId, reviews }: ReviewListProps) => {
    // Calculate stats
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
        : "0.0";

    const ratingCounts = {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
    };

    return (
        <div className="space-y-8">
            {/* Review Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-card/50 rounded-2xl border border-border/50">
                <div className="text-center md:text-left">
                    <div className="text-4xl font-bold font-display text-foreground">{averageRating}</div>
                    <div className="flex justify-center md:justify-start my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-5 h-5 ${star <= Number(averageRating)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-muted-foreground/30"
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-muted-foreground">{totalReviews} reviews</p>
                </div>

                <div className="col-span-2 space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-4">
                            <span className="w-3 text-sm font-medium">{rating}</span>
                            <Star className="w-4 h-4 text-muted-foreground/30" />
                            <Progress
                                value={totalReviews > 0 ? (ratingCounts[rating as keyof typeof ratingCounts] / totalReviews) * 100 : 0}
                                className="h-2"
                            />
                            <span className="w-8 text-sm text-muted-foreground text-right">
                                {ratingCounts[rating as keyof typeof ratingCounts]}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Review List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        No reviews yet. Be the first to share your experience!
                    </p>
                ) : (
                    reviews.map((review) => (
                        <Card key={review.id} className="bg-card/30 border-border/30">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.userName}`} />
                                            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="font-semibold text-foreground">{review.userName}</h4>
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(review.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {review.verified && (
                                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-medium">
                                            Verified Purchase
                                        </span>
                                    )}
                                </div>

                                <h5 className="font-semibold text-foreground mb-2">{review.title}</h5>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                    {review.content}
                                </p>

                                <div className="flex items-center gap-4">
                                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                        <ThumbsUp className="w-4 h-4 mr-2" />
                                        Helpful ({review.helpfulCount})
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};
