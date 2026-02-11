
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

const tiers = [
    {
        name: "Essential",
        price: 499,
        description: "The perfect introduction to premium cannabis lifestyle.",
        features: [
            "Monthly curated box (3 items)",
            "Access to member-only shop",
            "Digital community access",
            "Standard shipping included",
        ],
    },
    {
        name: "Elite",
        price: 999,
        description: "Elevate your experience with exclusive products and perks.",
        features: [
            "Monthly curated box (5 items)",
            "Early access to limited drops",
            "Priority shipping included",
            "10% discount on shop purchases",
            "Vip community access",
        ],
        popular: true,
    },
    {
        name: "Private",
        price: 1999,
        description: "The ultimate luxury experience for the true connoisseur.",
        features: [
            "Monthly curated box (7+ items)",
            "Personalized product selection",
            "Concierge service",
            "20% discount on shop purchases",
            "Exclusive event invitations",
            "Next-day shipping included",
        ],
    },
];

const SubscriptionPlans = () => {
    const { addItem } = useCart();

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Choose Your Membership</h1>
                <p className="text-xl text-muted-foreground">
                    Unlock exclusive access to premium products and experiences.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tiers.map((tier) => (
                    <Card key={tier.name} className={`flex flex-col ${tier.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                        <CardHeader>
                            <CardTitle className="text-2xl">{tier.name}</CardTitle>
                            <CardDescription>{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="text-4xl font-bold mb-6">
                                R {tier.price}
                                <span className="text-sm font-normal text-muted-foreground">/month</span>
                            </div>
                            <ul className="space-y-3">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                variant={tier.popular ? "default" : "outline"}
                                onClick={() => addItem({
                                    id: `sub-${tier.name.toLowerCase()}`,
                                    name: `${tier.name} Subscription`,
                                    price: tier.price,
                                    quantity: 1
                                })}
                            >
                                Subscribe Now
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionPlans;
