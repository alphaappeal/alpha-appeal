import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Helmet } from "react-helmet-async";

const tiers = [
    {
        name: "Essential",
        price: 499,
        description: "The perfect introduction to premium cannabis lifestyle.",
        icon: "eco",
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
        icon: "star",
        features: [
            "Monthly curated box (5 items)",
            "Early access to limited drops",
            "Priority shipping included",
            "10% discount on shop purchases",
            "VIP community access",
        ],
        popular: true,
    },
    {
        name: "Private",
        price: 1999,
        description: "The ultimate luxury experience for the true connoisseur.",
        icon: "verified",
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
        <>
            <Helmet>
                <title>Membership | Alpha Appeal</title>
                <meta name="description" content="Choose your Alpha Appeal membership tier and unlock exclusive access to premium cannabis lifestyle experiences." />
            </Helmet>

            <div className="min-h-screen bg-background-dark py-24">
                <div className="container mx-auto px-6">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="material-symbols-outlined text-primary text-5xl mb-6">workspace_premium</span>
                        <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6">
                            Choose Your <span className="text-primary italic">Membership</span>
                        </h1>
                        <p className="text-xl text-gray-400">
                            Unlock exclusive access to premium products, curated monthly experiences, and our private community network.
                        </p>
                    </div>

                    {/* Tiers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {tiers.map((tier) => (
                            <div
                                key={tier.name}
                                className={`relative group p-[1px] rounded-2xl transition-all duration-500 hover:scale-[1.02] ${tier.popular ? 'bg-gradient-to-b from-primary/50 to-transparent shadow-[0_0_40px_rgba(107,142,107,0.15)]' : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="glass-panel h-full rounded-2xl p-8 flex flex-col">
                                    {tier.popular && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 mb-6">
                                        <span className={`material-symbols-outlined text-3xl ${tier.popular ? 'text-primary' : 'text-gray-400'}`}>
                                            {tier.icon}
                                        </span>
                                        <h2 className="font-display text-2xl font-bold text-white uppercase tracking-wider">{tier.name}</h2>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                        {tier.description}
                                    </p>

                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-gray-400 text-xl">R</span>
                                            <span className="text-5xl font-bold text-white">{tier.price}</span>
                                            <span className="text-gray-500 text-sm">/month</span>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <ul className="space-y-4 mb-10">
                                            {tier.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-3">
                                                    <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                                    <span className="text-gray-300 text-sm leading-snug">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Button
                                        className={`w-full py-6 rounded-xl font-bold uppercase tracking-widest transition-all ${tier.popular
                                                ? 'bg-primary hover:bg-primary-dark text-white shadow-[0_0_20px_rgba(107,142,107,0.3)]'
                                                : 'bg-transparent border border-white/10 hover:border-primary text-white'
                                            }`}
                                        onClick={() => addItem({
                                            id: `sub-${tier.name.toLowerCase()}`,
                                            name: `${tier.name} Subscription`,
                                            price: tier.price,
                                            quantity: 1
                                        })}
                                    >
                                        Subscribe Now
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-20 text-center text-gray-500 text-sm">
                        <p>All memberships are billed monthly. Cancel anytime through your account settings.</p>
                        <p className="mt-2">Need a custom plan? <a href="/contact" className="text-primary hover:underline italic">Contact our concierge team</a>.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SubscriptionPlans;
