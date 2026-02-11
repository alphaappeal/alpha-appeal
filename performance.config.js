/**
 * Performance optimization configuration for South African hosting
 * Optimized for local CDN, caching, and mobile-first approach
 */

module.exports = {
  // Build optimization
  build: {
    // Enable compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Optimize assets
    assetsInlineLimit: 4096, // 4kb limit for inlining
    
    // Rollup options for better tree-shaking
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-*'],
          i18n: ['react-i18next', 'i18next'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },

  // Development server optimization
  server: {
    host: '0.0.0.0',
    port: 8080,
    open: true,
    cors: true,
    
    // Proxy for API requests (if needed)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Performance plugins
  plugins: [
    // Preload critical resources
    {
      name: 'preload-critical',
      transformIndexHtml(html) {
        return html.replace(
          '</head>',
          `<link rel="preload" href="/assets/main.css" as="style">
           <link rel="preload" href="/assets/main.js" as="script">
           <link rel="preconnect" href="https://fonts.googleapis.com">
           <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
           </head>`
        );
      },
    },
  ],

  // Optimize for mobile
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-*',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
  },
};

// South African specific optimizations
const southAfricaOptimizations = {
  // CDN configuration for South African regions
  cdn: {
    providers: [
      'cloudflare', // Has good presence in SA
      'aws-cloudfront', // Has Cape Town edge locations
      'google-cloud-cdn', // Has Johannesburg presence
    ],
    
    // Local caching strategy
    cacheStrategy: {
      staticAssets: '1y', // 1 year for static assets
      apiResponses: '1h', // 1 hour for API responses
      htmlPages: '1d', // 1 day for HTML pages
    },
  },

  // Mobile optimization
  mobile: {
    imageOptimization: {
      formats: ['webp', 'avif'],
      sizes: ['320w', '480w', '768w', '1024w', '1200w'],
      quality: 80,
    },
    
    fontOptimization: {
      preloadCritical: true,
      fontDisplay: 'swap',
      subset: ['latin', 'latin-ext'],
    },
  },

  // Network optimization for SA
  network: {
    compression: {
      gzip: true,
      brotli: true,
    },
    
    http2: true,
    http3: false, // Not widely supported in SA yet
    
    // Optimize for slower connections
    chunkSize: {
      maxInitialSize: 250000, // 250kb
      maxAsyncSize: 250000,
    },
  },
};

module.exports.southAfrica = southAfricaOptimizations;