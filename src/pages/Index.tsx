import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Alpha Appeal | Premium Cannabis Lifestyle</title>
        <meta
          name="description"
          content="South Africa's premier cannabis lifestyle subscription. Curated products, premium experiences, elevated culture."
        />
      </Helmet>

      <div className="min-h-screen bg-background-dark">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-background-dark to-background-dark"></div>

          {/* Decorative elements */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
                <span className="material-symbols-outlined text-primary text-sm">verified</span>
                <span className="text-sm text-gray-400 uppercase tracking-wider">Premium Cannabis Culture</span>
              </div>

              {/* Main heading */}
              <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                Elevate Your
                <br />
                <span className="text-primary italic">Lifestyle</span>
              </h1>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                South Africa's premier cannabis lifestyle subscription. Curated products, premium experiences, elevated culture.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/subscription">
                  <button className="btn-primary group">
                    Explore Membership
                    <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </button>
                </Link>
                <Link to="/shop">
                  <button className="btn-secondary">
                    Browse Shop
                  </button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto">
                <div>
                  <div className="text-4xl font-display font-bold text-primary mb-2">500+</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider">Members</div>
                </div>
                <div>
                  <div className="text-4xl font-display font-bold text-primary mb-2">100+</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider">Products</div>
                </div>
                <div>
                  <div className="text-4xl font-display font-bold text-primary mb-2">4.9★</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider">Rating</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <span className="material-symbols-outlined text-gray-600 text-3xl">expand_more</span>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-24 bg-surface-dark">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Curated Collection
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Premium products selected for the discerning enthusiast
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Product Card 1 */}
              <Link to="/shop" className="group">
                <div className="card-dark card-hover overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-transparent rounded-lg mb-6 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-6xl">spa</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    Premium Accessories
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Handcrafted pieces for the refined experience
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    Explore Collection
                    <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>

              {/* Product Card 2 */}
              <Link to="/shop" className="group">
                <div className="card-dark card-hover overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-transparent rounded-lg mb-6 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-6xl">local_florist</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    Botanical Essentials
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Carefully sourced, expertly curated selections
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    Explore Collection
                    <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>

              {/* Product Card 3 */}
              <Link to="/shop" className="group">
                <div className="card-dark card-hover overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-transparent rounded-lg mb-6 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-6xl">self_improvement</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    Wellness & Lifestyle
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Elevate your daily rituals and routines
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium">
                    Explore Collection
                    <span className="material-symbols-outlined ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Membership CTA Section */}
        <section className="py-24 bg-background-dark relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <span className="material-symbols-outlined text-primary text-5xl mb-6 inline-block">workspace_premium</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                Join the Movement
              </h2>
              <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
                Become part of South Africa's most intentional cannabis lifestyle community.
                Exclusive access, curated experiences, premium products.
              </p>
              <Link to="/subscription">
                <button className="btn-primary text-lg px-12 py-4">
                  View Membership Tiers
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-surface-dark">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">verified</span>
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">Premium Quality</h3>
                <p className="text-gray-400 text-sm">
                  Every product is carefully vetted and curated for excellence
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">groups</span>
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">Community First</h3>
                <p className="text-gray-400 text-sm">
                  Connect with like-minded individuals who share your values
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-primary text-3xl">eco</span>
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-3">Sustainable</h3>
                <p className="text-gray-400 text-sm">
                  Committed to responsible sourcing and environmental stewardship
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
