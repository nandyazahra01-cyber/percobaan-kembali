import express from 'express';
import { createServer as createViteServer } from 'vite';
import adminRoutes from './src/routes/adminRoutes.js';
import mentorRoutes from './src/routes/mentorRoutes.js';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Endpoints for Mentor & Admin
  app.use('/api/mentor', mentorRoutes);
  app.use('/api/admin', adminRoutes);

  // Serve static assets from root and public assets folders
  app.use('/assets', express.static('assets'));
  app.use('/assets', express.static('public/assets'));

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KAWIRA Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
