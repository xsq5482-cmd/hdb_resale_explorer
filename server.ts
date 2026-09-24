import express from 'express';
import { createServer as createViteServer } from 'vite';
import handleFlats from './api/flats.js';
import handleHealth from './api/health.js';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure IPv4 resolution first to prevent IPv6 timeouts to data.gov.sg
try {
  dns.setDefaultResultOrder?.('ipv4first');
} catch {
  // Ignore in environments where this is not supported
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Register shared API route handlers
  app.get('/api/flats', handleFlats);
  app.get('/api/health', handleHealth);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In development mode, mount Vite middleware into Express
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
