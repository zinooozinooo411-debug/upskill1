import express from 'express';
import path from 'path';
import { getDb } from './server/db.ts';
import authRoutes from './server/routes/authRoutes.ts';
import studentRoutes from './server/routes/studentRoutes.ts';
import teacherRoutes from './server/routes/teacherRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import notificationRoutes from './server/routes/notificationRoutes.ts';

async function startServer() {
  // Initialize Database
  console.log('Initializing SQLite database with sql.js...');
  await getDb();
  console.log('Database initialized successfully.');

  const app = express();
  // AI Studio requires the dev server to run strictly on port 3000
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/teacher', teacherRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Growth platform listening on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server listen error:', err);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup failure:', err);
  process.exit(1);
});
