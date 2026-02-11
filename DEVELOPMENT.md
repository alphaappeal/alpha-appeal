# Alpha Appeal - Local Development Guide

This guide provides comprehensive instructions for setting up and maintaining the Alpha Appeal project locally, independent of any external development platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Environment Configuration](#environment-configuration)
4. [Development Workflow](#development-workflow)
5. [Database Management](#database-management)
6. [Testing](#testing)
7. [Build & Deployment](#build--deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **Supabase CLI**: For local database management (optional but recommended)

### Installation Commands

```bash
# Install Node.js using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Verify installations
node --version  # Should show v18.x.x
npm --version   # Should show 8.x.x
git --version   # Should show git version
```

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/alphaappeal/alpha-appeal.git
cd alpha-appeal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
VITE_SUPABASE_URL="https://your-project.supabase.co"

# Optional: Local Development
VITE_API_URL="http://localhost:54321"
VITE_DEBUG_MODE="true"
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Environment Configuration

### Development Environment

For local development, use `.env.development`:

```env
VITE_SUPABASE_PROJECT_ID="dev-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="dev-publishable-key"
VITE_SUPABASE_URL="https://dev-project.supabase.co"
VITE_DEBUG_MODE="true"
```

### Production Environment

For production deployment, use `.env.production`:

```env
VITE_SUPABASE_PROJECT_ID="prod-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="prod-publishable-key"
VITE_SUPABASE_URL="https://prod-project.supabase.co"
VITE_DEBUG_MODE="false"
```

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_PROJECT_ID` | Supabase project identifier | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public API key for Supabase | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_DEBUG_MODE` | Enable debug logging | No |

## Development Workflow

### Code Style

This project uses ESLint and Prettier for code formatting:

```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Format code
npx prettier --write .
```

### Git Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   ```bash
   # Edit files
   # Test changes
   npm run lint
   ```

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push to Remote**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Go to GitHub repository
   - Create new pull request
   - Describe changes and get review

### Component Development

Components are located in `src/components/`:

```bash
# Create new component
mkdir src/components/NewComponent
touch src/components/NewComponent/index.tsx
touch src/components/NewComponent/styles.css
```

## Database Management

### Supabase Setup

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and API keys

2. **Run Migrations**
   ```bash
   # Using Supabase CLI
   supabase db push
   
   # Or manually run SQL files in supabase/migrations/
   ```

3. **Seed Data**
   ```bash
   # Run seed scripts if available
   supabase db seed
   ```

### Local Database (Optional)

For completely local development:

1. **Install Docker**
2. **Run Supabase Locally**
   ```bash
   supabase start
   ```
3. **Access Local Dashboard**
   - URL: http://localhost:54323
   - API: http://localhost:54321

### Database Schema

Key tables and their purposes:

- `alpha_partners` - Partner/vendor information
- `partner_products` - Product inventory and pricing
- `vendor_accounts` - Vendor user management
- `profiles` - User profiles and authentication
- `memberships` - Subscription and tier management

## Testing

### Unit Testing

This project uses Vitest for unit testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/components/YourComponent.test.tsx
```

### E2E Testing

For end-to-end testing, use Playwright:

```bash
# Install Playwright
npm install @playwright/test

# Run E2E tests
npx playwright test

# Run tests in headed mode
npx playwright test --headed
```

### Test Structure

```
src/
├── __tests__/
│   ├── components/
│   ├── pages/
│   └── utils/
└── components/
    └── YourComponent/
        ├── index.test.tsx
        └── __snapshots__/
```

## Build & Deployment

### Local Build

```bash
# Production build
npm run build

# Development build
npm run build:dev

# Preview build
npm run preview
```

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_PROJECT_ID
   vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
   vercel env add VITE_SUPABASE_URL
   ```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

Build and run:

```bash
docker build -t alpha-appeal .
docker run -p 3000:3000 alpha-appeal
```

## Troubleshooting

### Common Issues

#### 1. Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Supabase Connection Issues

- Verify environment variables
- Check Supabase project status
- Ensure correct API keys

#### 3. Build Failures

```bash
# Clear build cache
rm -rf dist
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

#### 4. Database Migration Issues

```bash
# Reset database
supabase db reset

# Re-run migrations
supabase db push
```

### Debug Mode

Enable debug logging:

```env
VITE_DEBUG_MODE=true
```

Check browser console for detailed logs.

### Performance Issues

1. **Bundle Size**
   ```bash
   npm run build -- --analyze
   ```

2. **Development Server**
   ```bash
   # Use faster development server
   npm run dev -- --host
   ```

3. **Hot Reload Issues**
   ```bash
   # Restart development server
   npm run dev
   ```

### Getting Help

1. **Check Logs**
   - Browser console
   - Terminal output
   - Supabase logs

2. **Common Solutions**
   - Clear cache: `npm run build -- --emptyOutDir`
   - Update dependencies: `npm update`
   - Check TypeScript: `npx tsc --noEmit`

3. **Contact Support**
   - Create GitHub issue
   - Check Supabase documentation
   - Review React/TypeScript docs

## Development Tips

### Performance Optimization

1. **Code Splitting**
   ```tsx
   const LazyComponent = React.lazy(() => import('./Component'));
   ```

2. **Memoization**
   ```tsx
   const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
   ```

3. **Image Optimization**
   ```tsx
   <img src={image} loading="lazy" alt="description" />
   ```

### Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use different keys for different environments

2. **Input Validation**
   ```tsx
   import { z } from 'zod';
   const schema = z.object({ email: z.string().email() });
   ```

3. **Authentication**
   - Always check authentication status
   - Use secure headers
   - Implement proper logout

### Code Organization

1. **Component Structure**
   ```
   src/components/
   ├── FeatureName/
   │   ├── index.tsx
   │   ├── styles.css
   │   ├── types.ts
   │   └── __tests__/
   ```

2. **Page Organization**
   ```
   src/pages/
   ├── FeaturePage/
   │   ├── index.tsx
   │   ├── components/
   │   └── hooks/
   ```

This guide should help you maintain and develop the Alpha Appeal project independently. Always refer to the latest documentation and best practices for React, TypeScript, and Supabase.