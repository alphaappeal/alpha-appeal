/**
 * Local development server for Alpha Appeal
 * Optimized for South African hosting and development
 */

const express = require('express');
const path = require('path');
const compression = require('compression');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for local development
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true
}));

// Enable gzip compression
app.use(compression());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d', // Cache static files for 1 day
  etag: true,
  lastModified: true
}));

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  etag: true
}));

// API routes (if any)
app.use('/api', (req, res) => {
  res.json({ message: 'Local API server running' });
});

// Handle client-side routing
app.get('*', (req, res) => {
  // Don't serve index.html for API routes or static assets
  if (req.path.startsWith('/api') || 
      req.path.startsWith('/locales') || 
      req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return res.status(404).send('Not found');
  }
  
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Alpha Appeal local server running at http://localhost:${PORT}`);
  console.log(`📡 Optimized for South African hosting`);
  console.log(`📁 Serving from: ${path.join(__dirname, 'dist')}`);
  console.log(`🔧 Development mode: ${process.env.NODE_ENV !== 'production'}`);
});

module.exports = app;