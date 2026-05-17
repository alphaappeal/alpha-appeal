# Alpha Appeal

**Alpha Appeal** is a sovereign lifestyle ecosystem merging high-end art, fashion, and culture into one exclusive community platform. The platform serves as a digital hub for luxury products, curated content, event maps, and a private members' club, with dedicated portals for members, vendors, and administrators.

---

## 🚀 Features

- **Exclusive Member Portal:** Secure user authentication with Supabase, personalized profiles, subscription management (Essential vs Elite tiers), and personal diary entries.
- **Vendor Dashboard:** A dedicated space for verified partners and store owners to manage their product catalog, track inventory, and view store analytics.
- **Admin Command Center:** Comprehensive admin tools for user management, system health monitoring, subscription tracking, financial overviews, and content moderation.
- **Interactive Community & Culture:** Explore high-end strains, culture items, and community posts. Includes real-time interactions (likes, comments) using a custom engagement engine.
- **Interactive Maps & Events:** Integrated Leaflet maps for discovering partner locations and exclusive events.
- **Progressive Web App (PWA):** Installable on mobile and desktop for a native-like experience.

## 🛠️ Technology Stack

This project is built with a modern, scalable tech stack:

- **Frontend Framework:** [React 18](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) for robust, type-safe code
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) for beautiful, responsive design
- **State Management:** [TanStack React Query](https://tanstack.com/query/latest) for efficient data fetching and caching
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Edge Functions)
- **Routing:** [React Router](https://reactrouter.com/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase project (for local development or production)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/alpha-appeal.git
   cd alpha-appeal
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```sh
   npm run dev
   ```

5. Open [http://localhost:8080](http://localhost:8080) in your browser to view the app.

---

## 🗄️ Database & Backend setup

To run the backend locally or sync types with your Supabase project, make sure you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed.

- **Link your project:** `npm run supabase:link`
- **Push database schema:** `npm run supabase:migrate`
- **Generate TypeScript definitions:** `npm run supabase:types`

## 📦 Build for Production

To create a production-ready build:
```sh
npm run build
```
The output will be generated in the `dist` folder, ready to be deployed to your hosting provider (e.g., Vercel, Netlify, Lovable).

---

## 🎨 UI/UX Philosophy
The platform is designed around a **luxury dark theme** utilizing charcoal, sage, and muted gold gradients. We focus heavily on glassmorphism, smooth micro-interactions, and premium typography (`Outfit` and `Playfair Display`) to ensure the digital experience matches the high-end nature of the Alpha Appeal brand.
