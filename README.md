# Alpha Appeal - Cannabis Lifestyle Platform

## Project Overview

Alpha Appeal is South Africa's most intentional lifestyle movement, offering premium curated cannabis experiences delivered monthly. This project represents a complete cannabis lifestyle subscription service with e-commerce, community features, and vendor management.

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Build Tools**: Vite, ESLint, TypeScript
- **Deployment**: Vercel

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alphaappeal/alpha-appeal.git
   cd alpha-appeal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_PROJECT_ID="your-project-id"
   VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8080`

### Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/               # Utility functions
├── data/              # Static data and configurations
└── assets/            # Images, icons, and other assets
```

## Features

### Core Functionality
- **Membership Tiers**: Three-tier subscription system
- **E-commerce**: Product catalog and checkout flow
- **Community**: User profiles, social features, and forums
- **Vendor Portal**: Partner management and product inventory
- **Admin Dashboard**: Complete administrative control

### Key Pages
- **Home**: Landing page with membership information
- **Shop**: Product catalog and purchasing
- **Community**: Social features and user interactions
- **Map**: Location-based partner discovery
- **Profile**: User account management
- **Admin**: Administrative dashboard

## Database Schema

The application uses Supabase with the following main tables:

- `alpha_partners` - Partner/vendor information
- `partner_products` - Product inventory
- `vendor_accounts` - Vendor user management
- `profiles` - User profiles and authentication
- `memberships` - Subscription management

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

### Local Production Build

```bash
npm run build
npm run preview
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the [Issues](https://github.com/alphaappeal/alpha-appeal/issues) section
- Contact the development team
- Review the Supabase documentation for backend-related queries
